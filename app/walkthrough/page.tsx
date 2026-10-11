import Link from 'next/link';
export const metadata={title:'OFFCUT engineering walkthrough'};
export default function WalkthroughPage(){
  return (
    <div className="studio">
      <header className="topbar">
        <a href="/" className="wordmark" aria-label="OFFCUT home">offcut<span className="mark-dot">.</span></a>
        <p>Make something from what’s left.</p>
      </header>
      <main className="walkthrough">
        <h1>OFFCUT engineering walkthrough</h1>
        <p className="provider-note">Illustrated input, real segmentation. Camera-photo accuracy and physical assembly remain unverified.</p>
        <div className="visuals">
          <video controls muted playsInline preload="metadata" width={1280} height={720} style={{maxWidth:'100%',aspectRatio:'16 / 9',height:'auto',background:'#100F0D'}}>
            <source src="/demo/engineering-walkthrough.mp4" type="video/mp4" />
            Your browser cannot play this video.
          </video>
        </div>
        <p className="example-explanation">
          The video has no autoplay and loads no external services. Burned-in captions match the spoken narration;
          the full text lives in the <a className="text-action" href="/demo/walkthrough-transcript.txt">walkthrough transcript</a>.
        </p>
        <p className="example-notice" role="note">
          <strong>Status:</strong> the public YouTube demo and physical proof are still pending. This page does not claim any rules are fulfilled.
        </p>
        <p className="table-notes">
          <Link className="text-action" href="/">← Back to the studio</Link>
        </p>
      </main>
      <footer>
        <span>offcut · A little less waste, a little more possibility.</span>
        <a href="https://github.com/rishikrrontala-bot/offcut" target="_blank" rel="noreferrer">Built by Rishik Rontala</a>
      </footer>
    </div>
  );
}
