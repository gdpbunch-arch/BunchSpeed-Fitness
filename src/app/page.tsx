import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  return (
    <main style={{ padding: 24, display: 'grid', gap: 16, maxWidth: 1000, margin: '0 auto' }}>
      {/* Brand row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Image src="/brand/logo.png" alt="Bunchspeed Fitness" width={48} height={48} />
        <h1 style={{ margin: 0 }}>Bunchspeed Fitness</h1>
      </div>

      {/* Hero image with overlay + text */}
      <div style={{ position: 'relative', width: '100%', height: 460, overflow: 'hidden', borderRadius: 12, border: '1px solid #eee' }}>
        <Image
          src="/brand/hero.jpg"  // change to /brand/hero.png if your file is PNG
          alt="Bunchspeed Fitness"
          width={1600}
          height={900}
          priority
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center 12%'  // focus higher to show face
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.25) 40%, rgba(0,0,0,0) 100%)' }} />
        <div style={{ position: 'absolute', left: 16, bottom: 16, color: 'white' }}>
          <div style={{ fontWeight: 700, fontSize: 22, lineHeight: 1 }}>Fueled for Performance</div>
        </div>
      </div>

      {/* Quick link */}
      <p>Quick link to your client portal page:</p>
      <p>
        <Link href="/client/today" style={{ padding: 12, border: '1px solid #eee', borderRadius: 8, textDecoration: 'none' }}>
          ➜ Open Client ▸ Today
        </Link>
      </p>
    </main>
  );
}
