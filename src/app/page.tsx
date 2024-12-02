import PdfViewer from '@/components/PdfViewer';

export default function Home() {
  return (
    <main>
      <div className='flex center'>
        <div>
        Hello world
        </div>
        <PdfViewer fileName="06233195-7ab6-4fc6-95d6-c60aa0da6f7c" />
        </div>
      
    </main>
  );
}
