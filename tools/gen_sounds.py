"""
Synthesize the four UI sounds the app requires.

These are generated from pure tones, so they carry no third-party licence and
can ship with the app. Kept short (<1s) and small (a few KB each).
"""
import math
import struct
import wave

RATE = 22050


def env(i, n, attack=0.01, release=0.25):
    """Simple attack/release envelope, values 0..1."""
    a = max(1, int(attack * n))
    r = max(1, int(release * n))
    if i < a:
        return i / a
    if i > n - r:
        return max(0.0, (n - i) / r)
    return 1.0


def tone(freq, dur, vol=0.5, attack=0.01, release=0.3, harmonics=(1.0, 0.25)):
    n = int(RATE * dur)
    out = []
    for i in range(n):
        t = i / RATE
        s = 0.0
        for k, amp in enumerate(harmonics, start=1):
            s += amp * math.sin(2 * math.pi * freq * k * t)
        s /= sum(harmonics)
        out.append(s * vol * env(i, n, attack, release))
    return out


def sweep(f0, f1, dur, vol=0.5):
    n = int(RATE * dur)
    out = []
    phase = 0.0
    for i in range(n):
        f = f0 + (f1 - f0) * (i / n)
        phase += 2 * math.pi * f / RATE
        out.append(math.sin(phase) * vol * env(i, n, 0.01, 0.4))
    return out


def mix(*layers):
    n = max(len(l) for l in layers)
    out = [0.0] * n
    for layer in layers:
        for i, v in enumerate(layer):
            out[i] += v
    peak = max(abs(v) for v in out) or 1.0
    return [v / peak * 0.85 for v in out]


def seq(*parts):
    out = []
    for p in parts:
        out.extend(p)
    return out


def silence(dur):
    return [0.0] * int(RATE * dur)


def write(path, samples):
    with wave.open(path, "w") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(RATE)
        frames = b"".join(
            struct.pack("<h", int(max(-1.0, min(1.0, s)) * 32767)) for s in samples
        )
        w.writeframes(frames)


BASE = "assets/sounds/"

# tap — very short soft wooden click
write(BASE + "tap.wav", tone(880, 0.055, vol=0.45, attack=0.002, release=0.9,
                             harmonics=(1.0, 0.4, 0.15)))

# correct — bright rising two-note chime (C6 -> E6)
write(BASE + "correct.wav", seq(
    tone(1046.5, 0.12, vol=0.5, release=0.5, harmonics=(1.0, 0.3)),
    tone(1318.5, 0.26, vol=0.5, release=0.6, harmonics=(1.0, 0.3)),
))

# wrong — gentle low falling boop, never harsh
write(BASE + "wrong.wav", sweep(360, 220, 0.26, vol=0.45))

# success — short celebratory arpeggio (C-E-G-C)
write(BASE + "success.wav", seq(
    tone(523.25, 0.11, vol=0.45, release=0.5),
    tone(659.25, 0.11, vol=0.45, release=0.5),
    tone(783.99, 0.11, vol=0.45, release=0.5),
    mix(tone(1046.5, 0.42, vol=0.5, release=0.7),
        tone(1567.98, 0.42, vol=0.18, release=0.7)),
))

print("done")
