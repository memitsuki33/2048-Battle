import React, { useState } from 'react';
import MenuScreen from './components/MenuScreen.jsx';
import LevelSelect from './components/LevelSelect.jsx';
import SinglePlayerGame from './components/SinglePlayerGame.jsx';
import BattleGame from './components/BattleGame.jsx';
import Tutorial from './components/Tutorial.jsx';

export default function App() {
  const [screen, setScreen] = useState('menu');
  const [gameConfig, setGameConfig] = useState(null);

  const goMenu = () => setScreen('menu');

  if (screen === 'menu') {
    return (
      <MenuScreen
        onSinglePlayer={() => setScreen('single-select')}
        onBattle={() => setScreen('battle-select')}
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

  if (screen === 'battle' && gameConfig) {
    return (
      <BattleGame
        p1Level={gameConfig.p1Level}
        p2Level={gameConfig.p2Level}
        onBack={goMenu}
      />
    );
  }

  return null;
}
