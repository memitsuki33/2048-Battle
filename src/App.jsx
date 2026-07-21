import React, { useState } from 'react';
import MenuScreen from './components/MenuScreen.jsx';
import LevelSelect from './components/LevelSelect.jsx';
import SinglePlayerGame from './components/SinglePlayerGame.jsx';
import MobileSinglePlayerGame from './components/MobileSinglePlayerGame.jsx';
import BattleGame from './components/BattleGame.jsx';
import MobileLobby from './components/MobileLobby.jsx';
import MobileBattleGame from './components/MobileBattleGame.jsx';
import Tutorial from './components/Tutorial.jsx';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [gameConfig, setGameConfig] = useState(null);

  const goMenu = () => {
    if (gameConfig?.ws) {
      try { gameConfig.ws.close(); } catch {}
    }
    setScreen('menu');
    setGameConfig(null);
  };

  if (screen === 'menu') {
    return (
      <MenuScreen
        onSinglePlayerPC={() => setScreen('single-select')}
        onSinglePlayerMobile={() => setScreen('mobile-single')}
        onBattlePC={() => setScreen('battle-select')}
        onBattleMobile={() => setScreen('mobile-lobby')}
        onTutorial={() => setScreen('tutorial')}
      />
    );
  }

  if (screen === 'tutorial') {
    return <Tutorial onBack={goMenu} />;
  }

  if (screen === 'single-select') {
    return (
      <LevelSelect
        mode="single"
        onBack={goMenu}
        onStart={() => setScreen('single')}
      />
    );
  }

  if (screen === 'battle-select') {
    return (
      <LevelSelect
        mode="battle"
        onBack={goMenu}
        onStart={(cfg) => {
          setGameConfig(cfg);
          setScreen('battle');
        }}
      />
    );
  }

  if (screen === 'single') {
    return <SinglePlayerGame onBack={goMenu} />;
  }

  if (screen === 'mobile-single') {
    return <MobileSinglePlayerGame onBack={goMenu} />;
  }

  if (screen === 'battle' && gameConfig) {
    return (
      <BattleGame
        level={gameConfig.level}
        onBack={goMenu}
      />
    );
  }

  if (screen === 'mobile-lobby') {
    return (
      <MobileLobby
        onBack={goMenu}
        onStart={(cfg) => {
          setGameConfig(cfg);
          setScreen('mobile-battle');
        }}
      />
    );
  }

  if (screen === 'mobile-battle' && gameConfig) {
    return (
      <MobileBattleGame
        ws={gameConfig.ws}
        level={gameConfig.level}
        playerIndex={gameConfig.playerIndex}
        onBack={goMenu}
      />
    );
  }

  return null;
}
