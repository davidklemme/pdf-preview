'use client'

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const defaultSearchText = "Die Erfüllung einer Alternative genügt, um die Erlaubnispflicht des Geschäfts zu begründen.";

export default function PdfViewer({ fileName }: { fileName: string }) {
  const [pdfUrl, setPdfUrl] = useState<string>();
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(8);
  const [searchText] = useState<string>(defaultSearchText);

  const highlightPattern = (text: string, pattern: string) => {
    return text.replace(pattern, (value) => `<mark>${value}</mark>`);
  };

  const textRenderer = useCallback(
    (textItem: { str: string }) => highlightPattern(textItem.str, searchText),
    [searchText]
  );

  const fetchPdf = async () => {
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fileName }),
      });

      if (!response.ok) throw new Error('Failed to fetch PDF');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  function onDocumentLoadSuccess({ numPages }: { numPages: number }): void {
    setNumPages(numPages);
  }

  return (
    <div className="flex flex-col items-center">
      {!pdfUrl ? (
        <button
          onClick={fetchPdf}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Load PDF
        </button>
      ) : (
        <>
          <div className="controls mb-4">
            <button
              disabled={pageNumber <= 1}
              onClick={() => setPageNumber(prev => prev - 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded mr-2 disabled:bg-gray-300"
            >
              Previous
            </button>
            <span className="mx-2">
              Page {pageNumber} of {numPages}
            </span>
            <button
              disabled={pageNumber >= numPages}
              onClick={() => setPageNumber(prev => prev + 1)}
              className="px-4 py-2 bg-blue-500 text-white rounded ml-2 disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
          <div className="pdf-container border rounded-lg shadow-lg p-4">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              className="max-w-full"
            >
              <Page 
                pageNumber={pageNumber} 
                renderTextLayer={true}
                renderAnnotationLayer={true}
                customTextRenderer={textRenderer}
                className="max-w-full"
              />
            </Document>
          </div>
        </>
      )}
    </div>
  );
}
