"""Music and sound effects for the Liburna film. This one has its own score (plucked strings, hand drums, flute) and does not use tools/synth.py."""
import numpy as np, soundfile as sf, json, subprocess
import os; os.chdir(os.path.dirname(os.path.abspath(__file__))); os.makedirs('out',exist_ok=True)
sr=44100; C=json.load(open('cues.json')); ORDER=['title','anatomy','sewn','oars','bireme','ram','outro']
cum=0; TL=[]
for n_ in ORDER:
    f0=round(cum*24); cum+=C[n_]['D']; TL.append(dict(n=n_,start=f0/24,frames=round(cum*24)-f0))
start={x['n']:x['start'] for x in TL}; T=sum(x['frames'] for x in TL)/24; n_s=int(T*sr); rng=np.random.default_rng(5)
# ---------------- music
bpm=112; beat=60/bpm; L=np.zeros(n_s); R=np.zeros(n_s)
def add(x,tt,pan=0.5,buf=None):
    i=int(tt*sr)
    if i>=n_s or i<0: return
    x=x[:n_s-i]; (L if buf is None else buf[0])[i:i+len(x)]+=x*(1-pan)*2*0.5; (R if buf is None else buf[1])[i:i+len(x)]+=x*pan
def pluck(f,dur,damp=0.996):
    N=int(sr/f); b=rng.uniform(-1,1,N); out=np.empty(int(dur*sr))
    for i in range(len(out)):
        out[i]=b[i%N]; b[i%N]=damp*0.5*(b[i%N]+b[(i+1)%N])
    return out*np.linspace(1,0.15,len(out))
def env(n,a=0.005,d=8): tt=np.arange(n)/sr; return np.minimum(1,tt/a)*np.exp(-tt*d)
def drum(amp=1.0):
    tt=np.arange(int(0.4*sr))/sr; return amp*(np.sin(2*np.pi*(62+70*np.exp(-tt*28))*tt)*np.exp(-tt*9)+0.12*rng.normal(size=len(tt))*np.exp(-tt*70))
def clap(amp=1.0):
    n=int(0.14*sr); x=rng.normal(size=n)*env(n,0.002,38); return amp*np.diff(x,prepend=0)*1.5
def shaker(amp=1.0):
    n=int(0.06*sr); x=rng.normal(size=n)*env(n,0.002,70); return amp*np.diff(np.diff(x,prepend=0),prepend=0)
def flute(f,dur,amp):
    tt=np.arange(int(dur*sr))/sr; e=np.minimum(1,tt/0.12)*np.minimum(1,(dur-tt)/0.25)
    return amp*e*(np.sin(2*np.pi*f*tt+0.3*np.sin(2*np.pi*5.5*tt))+0.3*np.sin(4*np.pi*f*tt)+0.1*np.sin(6*np.pi*f*tt))
m=lambda k: 440*2**((k-69)/12)
chords=[[50,57,62,65,69],[48,55,60,64,67],[46,53,58,62,65],[45,57,61,64,69],[50,57,62,65,69],[53,57,60,65,69],[48,55,60,64,67],[45,57,61,64,69]]  # Dm C Bb A | Dm F C A
mel=[[74,None,77,76],[72,None,76,None],[70,74,None,77],[73,None,76,81],[74,77,81,None],[81,None,77,76],[79,76,None,72],[73,76,None,None]]
cache={}
def pk(k,d):
    if (k,d) not in cache: cache[(k,d)]=pluck(m(k),d)
    return cache[(k,d)]
bar=4*beat; b=0; tt=0.0
while tt<T:
    ch=chords[b%8]; sec=b//8
    add(0.6*pk(ch[0]-12,1.8),tt); add(0.4*pk(ch[0]-12,1.0),tt+2.5*beat); add(0.35*pk(ch[0],1.0),tt+3*beat)
    for i,p in enumerate([1,3,2,4,3,2,4,3]):
        add((0.24 if i%2 else 0.34)*pk(ch[p],0.9),tt+i*beat/2,0.25+0.5*(i%2))
    if b>=1:
        for bt in (0,2): add(drum(0.55),tt+bt*beat)
        add(drum(0.3),tt+3.5*beat)
        for bt in (1,3): add(clap(0.16),tt+bt*beat,0.45)
        for i in range(8): add(shaker(0.5 if i%2 else 0.25),tt+i*beat/2,0.75)
    if b>=2:
        for i,nn in enumerate(mel[b%8]):
            if nn: add(flute(m(nn),beat*0.95,0.085),tt+i*beat,0.6)
    tt+=bar; b+=1
mus=np.stack([L,R],1)
for d,g in [(0.029,0.22),(0.053,0.18),(0.097,0.12)]:
    k=int(d*sr); mus[k:]+=g*mus[:-k]
fade=np.minimum(1,np.arange(n_s)/(0.8*sr))*np.minimum(1,(n_s-np.arange(n_s))/(3.0*sr)); mus*=fade[:,None]
mus=mus/np.abs(mus).max()*0.8; sf.write('out/music.wav',mus,sr)
# ---------------- sfx
S=[np.zeros(n_s),np.zeros(n_s)]
def bp_noise(dur,lo,hi):
    n=int(dur*sr); X=np.fft.rfft(rng.normal(size=n)); f=np.fft.rfftfreq(n,1/sr); X[(f<lo)|(f>hi)]=0; x=np.fft.irfft(X,n); return x/np.abs(x).max()
def popS(f0=520,f1=980,amp=0.5):
    n=int(0.09*sr); tt=np.arange(n)/sr; f=f0+(f1-f0)*tt/0.09; return amp*np.sin(2*np.pi*np.cumsum(f)/sr)*env(n,0.003,34)
def tick(amp=0.25,f=1800): n=int(0.03*sr); tt=np.arange(n)/sr; return amp*np.sin(2*np.pi*f*tt)*env(n,0.001,160)
def thud(amp=0.8): n=int(0.35*sr); tt=np.arange(n)/sr; return amp*(np.sin(2*np.pi*(55+60*np.exp(-tt*30))*tt)*np.exp(-tt*10)+0.3*bp_noise(0.35,200,1500)*np.exp(-tt*40))
def whoosh(dur=0.8,amp=0.5,lo=400,hi=5000): x=bp_noise(dur,lo,hi); return amp*x*np.hanning(len(x))**1.5
def riser(dur,amp=0.5): x=bp_noise(dur,600,7000); e=np.linspace(0,1,len(x))**2.5; return amp*x*e
def boom(amp=1.0):
    n=int(1.6*sr); tt=np.arange(n)/sr
    x=np.sin(2*np.pi*(42+50*np.exp(-tt*12))*tt)*np.exp(-tt*3.2)+0.7*bp_noise(1.6,150,3500)*np.exp(-tt*6)
    for k in range(6): i=int((0.02+0.05*k+0.02*rng.random())*sr); x[i:i+400]+=0.6*rng.normal(size=400)*np.exp(-np.arange(400)/60)
    return amp*x
def splash(amp=0.5,dur=1.2): x=bp_noise(dur,1200,9000); tt=np.arange(len(x))/sr; return amp*x*np.minimum(1,tt/0.03)*np.exp(-tt*3.5)
def ev(scene,tt,x,pan=0.5): add(x,start[scene]+tt,pan,S)
for n in ORDER[1:]: add(whoosh(0.85,0.45),start[n]-0.42,0.5,S)
q=C['title']['q']; ev('title',0.1,whoosh(2.2,0.4,300,3000)); ev('title',0.2,splash(0.25,2.0))
for i in range(7): ev('title',q[0]+i*0.07+0.28,thud(0.35) if i==6 else tick(0.3,900+60*i))
for d in (0,2.0): ev('title',q[1]+d,whoosh(0.5,0.25))
q=C['anatomy']['q']; rev=q[1]-0.9; ev('anatomy',rev-0.1,whoosh(0.6,0.5,800,8000)); ev('anatomy',1.4,popS())
for i_ in range(1,6): ev('anatomy',q[i_]+0.55,popS()); ev('anatomy',q[i_]-0.1,whoosh(0.7,0.22))
ev('anatomy',q[6]-0.1,whoosh(0.9,0.25))
for i_ in range(6): ev('anatomy',q[6]+1.0+i_*0.16,popS(520+40*i_,980+40*i_,0.4))
q=C['sewn']['q']; z0=q[2]; ev('sewn',q[0]+0.5,thud(0.9))
for i in range(12): ev('sewn',z0+0.3+i*0.17,tick(0.3,1500+40*i)); ev('sewn',q[3]+0.3+i*0.09,tick(0.35,500))
ev('sewn',z0+3.0,popS()); ev('sewn',q[3]+1.6,popS()); ev('sewn',q[5]-0.1,whoosh(1.2,0.3)); ev('sewn',q[5]+1.6,popS()); ev('sewn',q[1]+0.9,popS()); ev('sewn',q[4],popS(700,300,0.6)); ev('sewn',q[4]+0.15,popS())
q=C['oars']['q']; c0,c1=q[1]+0.4,q[2]+2.6
for i in range(25): ev('oars',c0+(c1-c0)*i/25,tick(0.3,900+25*i))
ev('oars',q[1]+0.7,popS()); ev('oars',c1+1.0,popS()); ev('oars',q[3]+0.4,popS()); ev('oars',q[3]+2.5,popS(700,400,0.5)); ev('oars',q[1]-0.2,whoosh(0.7,0.3)); ev('oars',c1,whoosh(0.8,0.3)); ev('oars',q[3]-0.1,whoosh(1.4,0.4,300,4000)); ev('oars',q[3]+2.0,whoosh(0.8,0.3))
q=C['bireme']['q']
for tt_ in (q[1]+.5,q[1]+1.3,q[2]+.4,q[2]+.5,q[2]+.9,q[3]+.5,q[4]+.7,q[5]+.6,q[5]+1.3): ev('bireme',tt_,popS())
ev('bireme',q[1]-0.35,whoosh(0.6,0.5,800,8000)); ev('bireme',q[2]-0.4,whoosh(0.6,0.5,800,8000)); ev('bireme',q[3]-0.1,whoosh(1.2,0.35)); ev('bireme',q[4]-0.3,whoosh(0.8,0.3)); ev('bireme',q[5]-0.2,whoosh(0.9,0.3))
for i_ in range(8): ev('bireme',q[4]+0.5+i_*0.28,whoosh(0.4,0.22,2000,9000)); ev('bireme',q[4]+0.5+i_*0.28+0.45,thud(0.35)); ev('bireme',q[4]+0.5+i_*0.28+0.45,tick(0.4,700))
q=C['ram']['q']; hit=q[1]+1.5; ev('ram',q[0]+1.6,popS()); ev('ram',q[1]-0.3,whoosh(0.5,0.45,800,8000)); ev('ram',q[1],riser(hit-q[1],0.6)); ev('ram',hit,boom(1.0)); ev('ram',hit+0.1,splash(0.6,1.8)); ev('ram',q[2]-0.2,popS())
q=C['outro']['q']
for tt_ in (q[0]+.2,q[1]+.1,q[2]+.6): ev('outro',tt_+0.3,thud(0.8)); ev('outro',tt_,whoosh(0.35,0.3))
ev('outro',q[3]+0.1,popS()); ev('outro',q[3]+2.0,popS())
sx=np.stack(S,1); sx=np.tanh(sx*1.2)*0.8; sf.write('out/sfx.wav',sx,sr)
# ---------------- narration + mix
ins=[]; fl=[]
for i,n in enumerate(ORDER):
    ins+=['-i',f'narr/{n}.wav']; fl.append(f'[{i}:a]aresample=44100,adelay={int(start[n]*1000)}:all=1[a{i}]')
fl.append(''.join(f'[a{i}]' for i in range(7))+'amix=inputs=7:normalize=0,highpass=f=70,loudnorm=I=-15:TP=-1.5,aresample=44100[v]')
subprocess.run(['ffmpeg','-v','error','-y',*ins,'-filter_complex',';'.join(fl),'-map','[v]','-t',str(T),'out/narr.wav'],check=True)
open('out/list.txt','w').write(''.join(f"file '{n}.mp4'\n" for n in ORDER)); print('T',T)
