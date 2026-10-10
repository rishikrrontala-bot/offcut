import type { Metadata } from 'next';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/instrument-serif/400.css';
import './globals.css';
export const metadata:Metadata={title:'OFFCUT — Make something from what’s left.',description:'Turn finite paper scraps into a traceable mosaic with actual-size cutting and assembly plans.',authors:[{name:'Rishik Rontala'}]};
export default function Layout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>;}
