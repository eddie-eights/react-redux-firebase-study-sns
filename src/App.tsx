import React, { useEffect } from "react";
import styles from "./App.module.css"; // <- CSS Modules スコープがcomponentと1対1の関係(class干渉しずらい)
import { useSelector, useDispatch } from "react-redux";
import { selectUser, login, logout } from "./features/userSlice";
import { auth } from "./firebase";
import Feed from "./componetns/Feed";
import Auth from "./componetns/Auth";

const App: React.FC = () => {
	// Reduxからグローバルステートを参照しローカル変数に代入
	const user = useSelector(selectUser);

	const dispatch = useDispatch();

	useEffect(() => {
		// firebaseのユーザーが変化(ログイン、ログアウト、ユーザー変更等)したときに発火
		const unSub = auth.onAuthStateChanged((authUser) => {
			if (authUser) {
				// ユーザーが存在すればユーザー情報のステートを更新
				dispatch(
					login({
						uid: authUser.uid,
						photoUrl: authUser.photoURL,
						displayName: authUser.displayName,
					})
				);
			} else {
				dispatch(logout());
			}
		});
		return () => {
			// Appコンポーネントがアンマウントされた際に発火
			unSub();
		};
	}, [dispatch]);

	return (
		<>
			{user.uid ? (
				// ユーザーが存在すればフィード画面へ遷移
				<div className={styles.app}>
					<Feed />
				</div>
			) : (
				// ユーザーが存在しなければログイン画面へ遷移
				<Auth />
			)}
		</>
	);
};

export default App;
