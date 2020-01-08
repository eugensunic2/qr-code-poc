import React, {
	useReducer,
	useEffect
} from 'react';
import Footer from './components/utils/Footer';
import PrivateRoute from './components/utils/PrivateRoute';
import Register from './components/main/Register';
import Login from './components/main/Login';
import NoMatch from './components/utils/NoMatch';
import ErrorContainer from './components/utils/ErrorContainer';
import VisitorPage from './components/main/VisitorPage';
import Header from './components/utils/Header';
import CreateContent from './components/main/CreateContent';
import OverviewContent from './components/main/OverviewContent';
import About from './components/main/About';
import AdminPage from './components/main/Admin';
import {
	Router,
	Route,
	Switch
} from 'react-router-dom';
import { history, isLoggedIn } from './helpers';
import ForgotPassword from './components/main/ForgotPassword';
import ChangePassword from './components/main/ChangePassword';
import { ROUTES } from './navigation';
import { useTranslation } from 'react-i18next';
import { IMAGE_HOST_PREFIX } from './config';

// global error reducer
const reducer = (
	state = { message: '' },
	action
) => {
	switch (action.type) {
		case 'global':
			return {
				...state,
				message: action.payload
			};
		default:
			return state;
	}
};
export const GlobalErrorContext = React.createContext(
	{}
);

const isVisitorPage = (path) =>
	path.indexOf(ROUTES.VISITOR_PAGE) > -1;
const shouldDisplayHeader = () =>
	(isVisitorPage(history.location.pathname) &&
		isLoggedIn()) ||
	!isVisitorPage(history.location.pathname);

function App() {
	const [error, dispatch] = useReducer(reducer, {
		message: ''
	});

	return (
		<GlobalErrorContext.Provider
			value={{ dispatchError: dispatch }}>
			<Router history={history}>
				{shouldDisplayHeader() && (
					<div>
						<Header />
					</div>
				)}
				<ErrorContainer message={error.message} />

				<div className='container'>
					<Switch>
						<PrivateRoute
							path={ROUTES.ADMIN}
							component={AdminPage}
						/>
						<Route
							path={
								ROUTES.VISITOR_PAGE + '/:qrCodeId'
							}
							component={VisitorPage}
						/>
						<PrivateRoute
							path={ROUTES.CHANGE_PASSWORD}
							component={ChangePassword}
						/>
						<Route
							path={ROUTES.FORGOT_PASSWORD}
							component={ForgotPassword}
						/>
						<Route
							exact
							path={ROUTES.HOME}
							component={Login}
						/>
						<Route
							path={ROUTES.LOGIN}
							component={Login}
						/>
						<PrivateRoute
							path={ROUTES.REGISTER}
							component={Register}
						/>
						<PrivateRoute
							path={ROUTES.CREATE}
							component={CreateContent}
						/>
						<PrivateRoute
							path={ROUTES.OVERVIEW}
							component={OverviewContent}
						/>
						<Route
							path={ROUTES.ABOUT}
							component={About}
						/>
						<Route component={NoMatch} />
					</Switch>
				</div>
			</Router>
			<Footer />
		</GlobalErrorContext.Provider>
	);
}

export default App;
