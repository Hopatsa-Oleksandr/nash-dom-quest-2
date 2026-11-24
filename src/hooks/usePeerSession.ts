import { useCallback, useEffect, useRef, useState } from 'react';
import Peer, { type DataConnection, type MediaConnection } from 'peerjs';
import {
  type ConnectionStatus,
  type GameState,
  type PeerMessage,
  type PlayerFocusView,
  type PlayerProfile,
  type Role,
  type SessionConfig,
} from '../types/game';
import { mergeGameState, sanitizeRoomCode } from '../utils/gameState';
import { playSquelchOff, playSquelchOn } from '../utils/audio';

interface UsePeerSessionParams {
  session: SessionConfig | null;
  gameState: GameState;
  setGameState: React.Dispatch<React.SetStateAction<GameState>>;
  localFocus: PlayerFocusView;
  onPartnerFocus: (role: Role, focus: PlayerFocusView) => void;
}

export interface PeerSessionApi {
  connectionStatus: ConnectionStatus;
  partnerOnline: boolean;
  isTalking: boolean;
  partnerTalking: boolean;
  micError: string | null;
  micReady: boolean;
  reconnectNow: () => void;
  broadcastState: (nextState: GameState) => void;
  broadcastFocus: (nextFocus: PlayerFocusView) => void;
  startTalking: () => void;
  stopTalking: () => void;
  disconnect: () => void;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
}

function makePeerId(roomCode: string, role: Role): string {
  const clean = sanitizeRoomCode(roomCode).replace(/-/g, '').toLowerCase() || 'v337';
  return `opvaliza337-${clean}-${role}`;
}

export function usePeerSession({
  session,
  gameState,
  setGameState,
  localFocus,
  onPartnerFocus,
}: UsePeerSessionParams): PeerSessionApi {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('idle');
  const [partnerOnline, setPartnerOnline] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [partnerTalking, setPartnerTalking] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);
  const [micReady, setMicReady] = useState(false);

  const peerRef = useRef<Peer | null>(null);
  const dataConnRef = useRef<DataConnection | null>(null);
  const mediaConnRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const stateRef = useRef<GameState>(gameState);
  stateRef.current = gameState;

  const sessionRef = useRef<SessionConfig | null>(session);
  sessionRef.current = session;

  const localFocusRef = useRef<PlayerFocusView>(localFocus);
  localFocusRef.current = localFocus;

  const onPartnerFocusRef = useRef(onPartnerFocus);
  onPartnerFocusRef.current = onPartnerFocus;

  const talkingRef = useRef(false);
  const reconnectTimerRef = useRef<number | null>(null);
  const heartbeatTimerRef = useRef<number | null>(null);
  const mountedRef = useRef(true);

  const getLocalProfile = useCallback((): PlayerProfile => {
    const s = sessionRef.current;
    if (!s) {
      return { role: 'p1', name: 'Юяся', gender: 'f' };
    }
    return {
      role: s.role,
      name: s.name,
      gender: s.gender,
    };
  }, []);

  const sendRaw = useCallback((msg: PeerMessage) => {
    const conn = dataConnRef.current;
    if (conn && conn.open) {
      try {
        conn.send(msg);
      } catch {
        // Ignore transient send errors; heartbeat/reconnect will reconcile
      }
    }
  }, []);

  const broadcastState = useCallback(
    (nextState: GameState) => {
      stateRef.current = nextState;
      if (sessionRef.current?.soloMode) return;
      sendRaw({
        type: 'SYNC_STATE',
        state: nextState,
        profile: getLocalProfile(),
        focus: localFocusRef.current,
      });
    },
    [getLocalProfile, sendRaw]
  );

  const broadcastFocus = useCallback(
    (nextFocus: PlayerFocusView) => {
      localFocusRef.current = nextFocus;
      const s = sessionRef.current;
      if (!s || s.soloMode) return;
      sendRaw({
        type: 'FOCUS_UPDATE',
        role: s.role,
        focus: nextFocus,
      });
    },
    [sendRaw]
  );

  const attachRemoteStream = useCallback((stream: MediaStream) => {
    const audioEl = remoteAudioRef.current;
    if (audioEl) {
      audioEl.srcObject = stream;
      audioEl.play().catch(() => {
        // Mobile Safari may require user gesture; will play on next interaction
      });
    }
  }, []);

  const ensureLocalMicStream = useCallback(async (): Promise<MediaStream | null> => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setMicError('Браузер не підтримує мікрофон (працює без голосу).');
      return null;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      // Default muted until PTT is held
      stream.getAudioTracks().forEach((track) => {
        track.enabled = talkingRef.current;
      });
      localStreamRef.current = stream;
      setMicReady(true);
      setMicError(null);
      return stream;
    } catch {
      setMicError('Доступ до мікрофона заборонено. Увімкніть мікрофон для голосу.');
      return null;
    }
  }, []);

  const placeVoiceCall = useCallback(
    (stream: MediaStream) => {
      const s = sessionRef.current;
      const peer = peerRef.current;
      if (!s || s.soloMode || !peer || peer.destroyed || !peer.open) return;

      const partnerRole: Role = s.role === 'p1' ? 'p2' : 'p1';
      const partnerId = makePeerId(s.roomCode, partnerRole);

      if (mediaConnRef.current && mediaConnRef.current.open) {
        return;
      }

      try {
        const call = peer.call(partnerId, stream);
        if (!call) return;
        mediaConnRef.current = call;
        call.on('stream', (remoteStream) => {
          attachRemoteStream(remoteStream);
        });
        call.on('close', () => {
          if (mediaConnRef.current === call) {
            mediaConnRef.current = null;
          }
        });
        call.on('error', () => {
          if (mediaConnRef.current === call) {
            mediaConnRef.current = null;
          }
        });
      } catch {
        // Voice call will retry on next PTT press
      }
    },
    [attachRemoteStream]
  );

  const handleIncomingData = useCallback(
    (raw: unknown) => {
      if (!raw || typeof raw !== 'object' || !('type' in raw)) return;
      const msg = raw as PeerMessage;

      if (msg.type === 'PTT_STATUS') {
        setPartnerTalking(Boolean(msg.talking));
        return;
      }

      if (msg.type === 'FOCUS_UPDATE') {
        onPartnerFocusRef.current(msg.role, msg.focus);
        return;
      }

      if (msg.type === 'PROFILE_UPDATE') {
        setGameState((prev) => ({
          ...prev,
          players: {
            ...prev.players,
            [msg.profile.role]: msg.profile,
          },
        }));
        return;
      }

      if (msg.type === 'SYNC_STATE' || msg.type === 'HEARTBEAT') {
        if (msg.focus) {
          onPartnerFocusRef.current(msg.profile.role, msg.focus);
        }
        setGameState((prev) => {
          const merged = mergeGameState(prev, msg.state);
          // Always ensure partner's profile metadata stays up to date
          const updatedPlayers = {
            ...merged.players,
            [msg.profile.role]: msg.profile,
          };
          if (merged === prev) {
            // Check if partner profile changed
            const prevPartner = prev.players[msg.profile.role];
            if (
              prevPartner.name !== msg.profile.name ||
              prevPartner.gender !== msg.profile.gender
            ) {
              return { ...prev, players: updatedPlayers };
            }
            return prev;
          }
          return {
            ...merged,
            players: updatedPlayers,
          };
        });
      }
    },
    [setGameState]
  );

  const bindDataConnection = useCallback(
    (conn: DataConnection) => {
      if (dataConnRef.current && dataConnRef.current !== conn) {
        try {
          dataConnRef.current.close();
        } catch {
          // ignore
        }
      }
      dataConnRef.current = conn;

      const onOpen = () => {
        if (!mountedRef.current) return;
        setConnectionStatus('connected');
        setPartnerOnline(true);
        // Immediate full authoritative state sync upon connect/reconnect
        try {
          conn.send({
            type: 'SYNC_STATE',
            state: stateRef.current,
            profile: getLocalProfile(),
            focus: localFocusRef.current,
          } satisfies PeerMessage);
        } catch {
          // ignore
        }
        // If local mic stream already initialized, establish voice channel
        if (localStreamRef.current) {
          placeVoiceCall(localStreamRef.current);
        }
      };

      if (conn.open) {
        onOpen();
      } else {
        conn.on('open', onOpen);
      }

      conn.on('data', handleIncomingData);

      conn.on('close', () => {
        if (!mountedRef.current) return;
        if (dataConnRef.current === conn) {
          dataConnRef.current = null;
        }
        setPartnerOnline(false);
        setPartnerTalking(false);
        setConnectionStatus((cur) => (cur === 'solo' ? 'solo' : 'reconnecting'));
      });

      conn.on('error', () => {
        if (!mountedRef.current) return;
        setPartnerOnline(false);
        setConnectionStatus((cur) => (cur === 'solo' ? 'solo' : 'reconnecting'));
      });
    },
    [getLocalProfile, handleIncomingData, placeVoiceCall]
  );

  const attemptPartnerConnect = useCallback(() => {
    const s = sessionRef.current;
    const peer = peerRef.current;
    if (!s || s.soloMode || !peer || peer.destroyed) return;

    if (peer.disconnected) {
      try {
        peer.reconnect();
      } catch {
        // ignore
      }
      return;
    }

    if (!peer.open) return;

    if (dataConnRef.current && dataConnRef.current.open) {
      return;
    }

    const partnerRole: Role = s.role === 'p1' ? 'p2' : 'p1';
    const partnerId = makePeerId(s.roomCode, partnerRole);

    try {
      const conn = peer.connect(partnerId, {
        reliable: true,
        serialization: 'json',
      });
      if (conn) {
        bindDataConnection(conn);
      }
    } catch {
      // Auto-reconnect loop will retry in 3s
    }
  }, [bindDataConnection]);

  const teardownAll = useCallback(() => {
    if (reconnectTimerRef.current !== null) {
      window.clearInterval(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (heartbeatTimerRef.current !== null) {
      window.clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }

    if (mediaConnRef.current) {
      try {
        mediaConnRef.current.close();
      } catch {
        // ignore
      }
      mediaConnRef.current = null;
    }

    if (dataConnRef.current) {
      try {
        dataConnRef.current.close();
      } catch {
        // ignore
      }
      dataConnRef.current = null;
    }

    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch {
        // ignore
      }
      peerRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }

    talkingRef.current = false;
    setIsTalking(false);
    setPartnerTalking(false);
    setPartnerOnline(false);
    setMicReady(false);
    setMicError(null);
    setConnectionStatus('idle');
  }, []);

  const initPeer = useCallback(() => {
    const s = sessionRef.current;
    if (!s) return;

    if (s.soloMode) {
      teardownAll();
      setConnectionStatus('solo');
      setPartnerOnline(false);
      return;
    }

    // Tear down any previous peer before re-initializing
    if (peerRef.current) {
      try {
        peerRef.current.destroy();
      } catch {
        // ignore
      }
      peerRef.current = null;
    }

    setConnectionStatus('connecting');
    const myPeerId = makePeerId(s.roomCode, s.role);

    const peer = new Peer(myPeerId, {
      debug: 0,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
          { urls: 'stun:stun2.l.google.com:19302' },
        ],
      },
    });

    peerRef.current = peer;

    peer.on('open', () => {
      if (!mountedRef.current) return;
      setConnectionStatus('reconnecting');
      attemptPartnerConnect();
    });

    peer.on('connection', (incomingConn) => {
      if (!mountedRef.current) return;
      bindDataConnection(incomingConn);
    });

    peer.on('call', (incomingCall) => {
      if (!mountedRef.current) return;
      mediaConnRef.current = incomingCall;
      // Answer with local mic if ready, otherwise answer empty so we still hear partner
      if (localStreamRef.current) {
        incomingCall.answer(localStreamRef.current);
      } else {
        incomingCall.answer();
      }
      incomingCall.on('stream', (remoteStream) => {
        attachRemoteStream(remoteStream);
      });
      incomingCall.on('close', () => {
        if (mediaConnRef.current === incomingCall) {
          mediaConnRef.current = null;
        }
      });
    });

    peer.on('disconnected', () => {
      if (!mountedRef.current) return;
      setPartnerOnline(false);
      setConnectionStatus('reconnecting');
    });

    peer.on('error', (err) => {
      if (!mountedRef.current) return;
      if (err.type === 'peer-unavailable') {
        // Partner hasn't joined yet — stay in reconnecting state
        setPartnerOnline(false);
        setConnectionStatus('reconnecting');
      } else if (err.type === 'unavailable-id') {
        // Previous tab/session still closing on signaling server; retry soon
        setConnectionStatus('reconnecting');
      } else {
        setConnectionStatus('reconnecting');
      }
    });
  }, [attachRemoteStream, attemptPartnerConnect, bindDataConnection, teardownAll]);

  // Lifecycle effect for PeerJS, 3-second auto-reconnect, and 2-second heartbeat
  useEffect(() => {
    mountedRef.current = true;
    if (!session) {
      teardownAll();
      return;
    }

    initPeer();

    if (!session.soloMode) {
      // Auto-reconnect every 3 seconds if disconnected
      reconnectTimerRef.current = window.setInterval(() => {
        if (!mountedRef.current || !sessionRef.current || sessionRef.current.soloMode) return;
        const peer = peerRef.current;
        if (!peer || peer.destroyed) {
          initPeer();
          return;
        }
        if (peer.disconnected) {
          try {
            peer.reconnect();
          } catch {
            initPeer();
          }
          return;
        }
        if (!dataConnRef.current || !dataConnRef.current.open) {
          attemptPartnerConnect();
        }
      }, 3000);

      // 2-second authoritative state heartbeat broadcast
      heartbeatTimerRef.current = window.setInterval(() => {
        if (!mountedRef.current || !sessionRef.current || sessionRef.current.soloMode) return;
        const conn = dataConnRef.current;
        if (conn && conn.open) {
          try {
            conn.send({
              type: 'HEARTBEAT',
              state: stateRef.current,
              profile: getLocalProfile(),
              focus: localFocusRef.current,
            } satisfies PeerMessage);
          } catch {
            // ignore
          }
        }
      }, 2000);
    }

    return () => {
      mountedRef.current = false;
      teardownAll();
    };
  }, [
    session?.roomCode,
    session?.role,
    session?.soloMode,
    initPeer,
    attemptPartnerConnect,
    getLocalProfile,
    teardownAll,
  ]);

  const reconnectNow = useCallback(() => {
    const s = sessionRef.current;
    if (!s || s.soloMode) return;
    setConnectionStatus('connecting');
    const peer = peerRef.current;
    if (!peer || peer.destroyed) {
      initPeer();
    } else if (peer.disconnected) {
      try {
        peer.reconnect();
      } catch {
        initPeer();
      }
    } else {
      attemptPartnerConnect();
    }
  }, [attemptPartnerConnect, initPeer]);

  const startTalking = useCallback(() => {
    if (talkingRef.current) return;
    talkingRef.current = true;
    setIsTalking(true);
    playSquelchOn();

    // Ensure remote audio playback is unlocked on mobile Safari
    if (remoteAudioRef.current && remoteAudioRef.current.srcObject) {
      remoteAudioRef.current.play().catch(() => {});
    }

    const s = sessionRef.current;
    if (s && !s.soloMode) {
      sendRaw({ type: 'PTT_STATUS', talking: true, role: s.role });
      ensureLocalMicStream().then((stream) => {
        if (!stream) return;
        stream.getAudioTracks().forEach((track) => {
          track.enabled = talkingRef.current;
        });
        if (talkingRef.current) {
          placeVoiceCall(stream);
        }
      });
    }
  }, [ensureLocalMicStream, placeVoiceCall, sendRaw]);

  const stopTalking = useCallback(() => {
    if (!talkingRef.current) return;
    talkingRef.current = false;
    setIsTalking(false);
    playSquelchOff();

    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    }

    const s = sessionRef.current;
    if (s && !s.soloMode) {
      sendRaw({ type: 'PTT_STATUS', talking: false, role: s.role });
    }
  }, [sendRaw]);

  // Safety release if browser loses focus while holding PTT
  useEffect(() => {
    const onBlur = () => {
      if (talkingRef.current) {
        stopTalking();
      }
    };
    window.addEventListener('blur', onBlur);
    return () => window.removeEventListener('blur', onBlur);
  }, [stopTalking]);

  return {
    connectionStatus,
    partnerOnline,
    isTalking,
    partnerTalking,
    micError,
    micReady,
    reconnectNow,
    broadcastState,
    broadcastFocus,
    startTalking,
    stopTalking,
    disconnect: teardownAll,
    remoteAudioRef,
  };
}
