"""Join the rendered scenes and add sound. Uses whichever of narr.wav, music.wav and sfx.wav exist in films/<film>/out.
Music is lowered automatically under the narration. Video is copied, not re-encoded.
Usage: python3 tools/mix.py <film> [--music-db 10] [--crf 0]   (--crf N re-encodes the final file smaller, e.g. 23)"""
import os, sys, subprocess, argparse
from _timeline import timeline, film_dir
ap = argparse.ArgumentParser(); ap.add_argument('film'); ap.add_argument('--music-db', type=float, default=10); ap.add_argument('--crf', type=int, default=0); a = ap.parse_args()
out = os.path.join(film_dir(a.film), 'out'); TL, _ = timeline(a.film); run = lambda c: subprocess.run(c, check=True, cwd=out)
missing = [t['n'] for t in TL if not os.path.exists(os.path.join(out, t['n'] + '.mp4'))]
if missing: sys.exit(f'Render these scenes first: {missing}')
open(os.path.join(out, 'list.txt'), 'w').write(''.join(f"file '{t['n']}.mp4'\n" for t in TL))
run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', 'silent.mp4'])
has = {k: os.path.exists(os.path.join(out, k + '.wav')) for k in ('narr', 'music', 'sfx')}; final = f'{a.film}.mp4'
if not any(has.values()): os.replace(os.path.join(out, 'silent.mp4'), os.path.join(out, final))
else:
    ins, fl, mixin, i = ['-i', 'silent.mp4'], [], [], 1
    if has['narr']: ins += ['-i', 'narr.wav']; fl.append(f'[{i}:a]asplit[n1][n2]'); mixin.append('[n1]'); i += 1
    if has['music']:
        ins += ['-i', 'music.wav']; fl.append(f'[{i}:a]volume={a.music_db}dB,alimiter=limit=0.55:attack=3:release=60[m]'); i += 1
        if has['narr']: fl.append('[m][n2]sidechaincompress=threshold=0.03:ratio=5:attack=30:release=450[md]'); mixin.append('[md]')
        else: mixin.append('[m]')
    elif has['narr']: fl.append('[n2]anullsink')
    if has['sfx']: ins += ['-i', 'sfx.wav']; fl.append(f'[{i}:a]volume=0.55[s]'); mixin.append('[s]'); i += 1
    fl.append(''.join(mixin) + f'amix=inputs={len(mixin)}:normalize=0,alimiter=limit=0.95[a]')
    run(['ffmpeg', '-v', 'error', '-y', *ins, '-filter_complex', ';'.join(fl), '-map', '0:v', '-map', '[a]', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-shortest', '-movflags', '+faststart', 'tmp_final.mp4'])
    os.replace(os.path.join(out, 'tmp_final.mp4'), os.path.join(out, final))
if a.crf:
    run(['ffmpeg', '-v', 'error', '-y', '-i', final, '-c:v', 'libx264', '-crf', str(a.crf), '-preset', 'medium', '-pix_fmt', 'yuv420p', '-c:a', 'copy', '-movflags', '+faststart', 'tmp_small.mp4']); os.replace(os.path.join(out, 'tmp_small.mp4'), os.path.join(out, final))
print('wrote', os.path.join(out, final))
