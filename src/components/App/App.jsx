import React, { useEffect } from 'react';
import {
  HashRouter as Router, // Ensure Router wraps the entire component tree
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
import './App.css';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(store => store.user);

  useEffect(() => {
    dispatch({ type: 'FETCH_USER' });
  }, [dispatch]);

  return (
    <Router> 
      <div>
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
    </Router>
  );
}

export default App;
