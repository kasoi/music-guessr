import { Button } from '@mui/material';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { CURRENT_TRACK_FILE_URL, NEXT_TRACK_URL } from './config';

const TIME_TYPES = [
  {
    label: '1s',
    time: 1,
  },
  {
    label: '3s',
    time: 3,
  },
  {
    label: '7s',
    time: 7,
  },
  {
    label: '15s',
    time: 15,
  },
  {
    label: '30s',
    time: 30,
  },
];
const audio = new Audio();

function App() {
  const player = useRef(null);
  const [track, setTrack] = useState(undefined);
  const [startTime, setStartTime] = useState(undefined);
  const [currentTimeType, setCurrentTimeType] = useState(TIME_TYPES[0]);
  const [loading, setLoading] = useState(false);
  const [showArtist, setShowArtist] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [metadataLoaded, setMetaDataLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [timer, setTimer] = useState(null);

  const showTrack = () => {
    setShowArtist(true);
    setShowTitle(true);
  }

  const playTrack = () => {
    audio.play();
    audio.currentTime = startTime;
    if (timer) clearTimeout(timer);
    setPlaying(true);
  }

  const stopTrack = () => {
    audio.pause();
    setPlaying(false);
  }

  useEffect(() => {
    if (!playing) return;
    const playTime = currentTimeType.time * 1000;
    const localTimer = setTimeout(() => {
      stopTrack();
      clearTimeout(localTimer);
    }, playTime);
    setTimer(localTimer);
  }, [playing, currentTimeType]);

  const setTimeLength = (timeType) => {
    setCurrentTimeType(timeType);
    playTrack(timeType);
  }

  const getNextTrack = async () => {
    setShowTitle(false);
    setLoading(true);
    const result = await axios.get(NEXT_TRACK_URL);
    setTrack(result.data);
  }

  useEffect(() => {
    if (!track) return;
    const length = track.duration;
    const toStart = (0.2 + (Math.random() * 0.2)) * length;
    setStartTime(toStart);

    audio.src = `${CURRENT_TRACK_FILE_URL}?uniq=${track.name}`;
  }, [track]);

  const handleAudioMetadata = (e) => {
    setLoading(false);
    setTimeLength(TIME_TYPES[0]);
  }

  useEffect(() => {
    audio.volume = 0.2;
    audio.addEventListener('loadedmetadata', handleAudioMetadata);
  });

  return (
    <div className="App">
      <div className='header'>Track guessr</div>
      <div className='content'>
        <Button onClick={getNextTrack} className="nextTrack">Next track</Button>
        {
          track !== undefined && (
            <>
            <div className='timePanel'>
              {TIME_TYPES.map((item) => 
                <Button
                  onClick={() => setTimeLength(item)}
                  id={`time-${item.label}`}
                  className="timeButton"
                  variant={currentTimeType === item ? 'outlined' : 'text'}
                >{item.label}</Button>
              )}
            </div>
            <Button onClick={() => setShowTitle(true)} id="reveal-track" className="authorButton">Reveal track</Button>
            <div className='trackName'>{showTitle ? `${track.artist} - ${track.title}` : '_ _ _ _ _ _ _ _ _ _ _ _ _' }</div>
            <Button onClick={() => setShowTitle(true)} id="reveal-author" className="authorButton">Reveal author</Button>
            <Button onClick={() => setShowTitle(true)} id="reveal-title" className="authorButton">Reveal title</Button>
            </>
          )
        }
      </div>
    </div>
  );
}

export default App;
