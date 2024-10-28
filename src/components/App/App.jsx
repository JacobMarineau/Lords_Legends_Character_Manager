/** @jsxImportSource @emotion/react */
import React, { useEffect } from 'react';
import { css } from '@emotion/react';
import {
  HashRouter as Router, 
  Redirect,
  Route,
  Switch,
} from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Nav from '../Nav/Nav';
import Footer from '../Footer/Footer';
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import UserPage from '../UserPage/UserPage';
import InfoPage from '../InfoPage/InfoPage';
import LandingPage from '../LandingPage/LandingPage';
import LoginPage from '../LoginPage/LoginPage';
import RegisterPage from '../RegisterPage/RegisterPage';
import CharacterFormPart1 from '../CharacterForm/CharacterForm';
import CharacterFormPart2 from '../CharacterForm/CharacterFormPart2';
import CharacterFormPart3 from '../CharacterForm/CharacterFromPart3';
import CharacterSummary from '../CharacterSummary/CharacterSummary';
import CharacterSheet from '../CharacterSheet/CharacterSheet';
import TemplateFunction from '../TemplateFunction/TemplateFunction';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(store => store.user);

  useEffect(() => {
    dispatch({ type: 'FETCH_USER' });
  }, [dispatch]);

  const appContainerStyle = css`
    background-image: url('../../public/beautiful-fantasy-forest-landscape-with-river-and-trees-3d-render-ai-generated-free-photo.jpg');
    background-size: cover;
    background-repeat: no-repeat;
    background-attachment: fixed;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.4);
      z-index: -1;
    }
  `;

  const contentStyle = css`
    max-width: 1400px;
    width: 100%;
    padding: 20px;
    background-color: rgba(255, 255, 255, 0.9);
    box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
    border-radius: 8px;
  `;

  return (
    <Router> 
      <div css={appContainerStyle}>
        <div css={contentStyle}>
          <Nav />
          <Switch>
            <Redirect exact from="/" to="/home" />
            <Route exact path="/characterstats1" component={CharacterFormPart1} />
            <Route exact path="/characterstats2" component={CharacterFormPart2} />
            <Route exact path="/characterstats3" component={CharacterFormPart3} />
            <Route exact path="/character-summary/:userId" component={CharacterSummary} />
            <Route exact path="/character-sheet/:characterId" component={CharacterSheet} />
            <ProtectedRoute exact path="/user" component={UserPage} />
            <ProtectedRoute exact path="/info" component={InfoPage} />
            <Route exact path="/login">
              {user.id ? <Redirect to="/user" /> : <LoginPage />}
            </Route>
            <Route exact path="/registration">
              {user.id ? <Redirect to="/user" /> : <RegisterPage />}
            </Route>
            <Route exact path="/home">
              {user.id ? <Redirect to="/user" /> : <LandingPage />}
            </Route>
            <Route>
              <h1>404</h1>
            </Route>
          </Switch>
          <Footer />
        </div>
      </div>
    </Router>
  );
}

export default App;
