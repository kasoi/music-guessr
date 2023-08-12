import { Button, Slider, Stack } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import './App.css';
import { CURRENT_TRACK_FILE_URL, NEXT_TRACK_URL } from './config';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { perceptualToAmplitude } from '@discordapp/perceptual';

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
  const [track, setTrack] = useState(undefined);
  const [startTime, setStartTime] = useState(undefined);
  const [currentTimeType, setCurrentTimeType] = useState(TIME_TYPES[0]);
  const [isFirstRun, setIsFirstRun] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showArtist, setShowArtist] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [metadataLoaded, setMetaDataLoaded] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [timer, setTimer] = useState(null);
  const [speed, setSpeed] = useState(1);
  
  const [volume, setVolume] = useState(15);

  const handleChange = (event, newValue) => {
    setVolume(newValue);
  };

  const showTrack = () => {
    setShowArtist(true);
    setShowTitle(true);
  }
  
  const handleChangeSpeed = (newSpeed) => {
    setSpeed(newSpeed);
    console.log('new speed:', newSpeed);
    audio.playbackRate = newSpeed;
    console.log('set playback rate to ', audio.playbackRate);
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
    setIsFirstRun(false);
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
    audio.volume = perceptualToAmplitude(volume / 100);
    audio.addEventListener('loadedmetadata', handleAudioMetadata);
  });

  return (
    <div className="App">
      <div className='header'>Track guessr</div>
      <div className='content'>
        {(isFirstRun || showTitle) && <Button onClick={getNextTrack} className="nextTrack">Next track</Button>}
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
              <Stack direction="row" style={{width: 250}} alignItems="center">
                <VolumeDown />
                <Slider aria-label="Volume" value={volume} onChange={handleChange} />
                <VolumeUp />
              </Stack>
              <div className='timePanel'>
                  <Button
                    onClick={() => handleChangeSpeed(1)}
                    id={`speed-normal`}
                    className="timeButton"
                    variant={speed === 1 ? 'outlined' : 'text'}
                  >
                    Normal speed
                  </Button>
                  <Button
                    onClick={() => handleChangeSpeed(0.5)}
                    id={`speed-half`}
                    className="timeButton"
                    variant={speed === 0.5 ? 'outlined' : 'text'}
                  >
                    Half speed
                  </Button>
                  <Button
                    onClick={() => handleChangeSpeed(-1)}
                    id={`speed-backwards`}
                    className="timeButton"
                    variant={speed === -1 ? 'outlined' : 'text'}
                  >
                    Backwards
                  </Button>
              </div>
            </>
          )
        }
      </div>
    </div>
  );
}

export default App;
