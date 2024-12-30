import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './popup.css';

const Popup = () => {
    const [status, setStatus] = useState('');

    const copyTranscript = async () => {
        try {
            setStatus('Copying transcript...');

            // Get the active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            // Execute content script to get transcript
            const result = await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                function: () => {
                    // Find transcript container
                    const transcriptItems = document.querySelectorAll('ytd-transcript-segment-renderer');
                    if (transcriptItems.length === 0) {
                        return { success: false, message: 'No transcript found. Please open the transcript panel first.' };
                    }

                    // Extract and combine transcript text
                    const transcript = Array.from(transcriptItems)
                        .map(item => item.querySelector('#text').textContent.trim())
                        .join('\\n');

                    return { success: true, transcript };
                },
            });

            const response = result[0].result;
            if (!response.success) {
                setStatus(response.message);
                return;
            }

            // Copy to clipboard
            await navigator.clipboard.writeText(response.transcript);
            setStatus('Transcript copied successfully!');
        } catch (error) {
            setStatus('Error: ' + error.message);
        }
    };

    return (
        <div className="popup">
            <h2>YouTube Transcript Copier</h2>
            <button onClick={copyTranscript}>Copy Transcript</button>
            {status && <p className="status">{status}</p>}
        </div>
    );
};

const root = createRoot(document.getElementById('root'));
root.render(<Popup />); 