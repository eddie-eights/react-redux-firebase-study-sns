import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { updateUserProfile } from "../features/userSlice";
import styles from "./Auth.module.css";
import { auth, provider, storage } from "../firebase";

import {
	Avatar,
	Button,
	CssBaseline,
	TextField,
	Paper,
	Grid,
	Typography,
	makeStyles,
	Modal,
	IconButton,
	Box,
} from "@material-ui/core";

import SendIcon from "@material-ui/icons/Send";
import CameraIcon from "@material-ui/icons/Camera";
import EmailIcon from "@material-ui/icons/Email";
import LockOutlinedIcon from "@material-ui/icons/LockOutlined";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";

// passリセットモーダルを画面中央に表示
function getModalStyle() {
	const top = 50;
	const left = 50;
	return {
		top: `${top}%`,
		left: `${left}%`,
		transform: `translate(-${top}%, -${left}%)`,
	};
}

const useStyles = makeStyles((theme) => ({
	root: {
		height: "100vh",
	},
	modal: {
		outline: "none",
		position: "absolute",
		width: 400,
		borderRadius: 10,
		backgroundColor: "white",
		boxShadow: theme.shadows[5],
		padding: theme.spacing(10),
	},
	image: {
		backgroundImage:
			"url(https://danmee.jp/wp-content/uploads/2022/06/twice-imnayeon-1.jpg)",
		backgroundRepeat: "no-repeat",
		backgroundColor:
			theme.palette.type === "light"
				? theme.palette.grey[50]
				: theme.palette.grey[900],
		backgroundSize: "cover",
		backgroundPosition: "center",
	},
	paper: {
		margin: theme.spacing(8, 4),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%",
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

const Auth: React.FC = () => {
	const classes = useStyles();
	const dispatch = useDispatch();

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [username, setUsername] = useState("");
	const [avatarImage, setAvatarImage] = useState<File | null>(null); //JSで定義されているFile型
	const [isLogin, setIsLogin] = useState(true);
	const [openModal, setOpenModal] = React.useState(false);
	const [resetEmail, setResetEmail] = useState("");

	const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files![0]) {
			//<- 「!」nullではないと宣言
			setAvatarImage(e.target.files![0]);
			e.target.value = "";
		}
	};

	const sendResetEmail = async (e: React.MouseEvent<HTMLElement>) => {
		await auth
			.sendPasswordResetEmail(resetEmail) //<- firebaeの機能
			.then(() => {
				setOpenModal(false);
				setResetEmail("");
			})
			.catch((err) => {
				alert(err.message);
				setResetEmail("");
			});
	};

	// Googleサインイン
	const signInGoogle = async () => {
		await auth.signInWithPopup(provider).catch((err) => alert(err.message));
	};
	// Emailサインイン
	const signInEmail = async () => {
		await auth.signInWithEmailAndPassword(email, password);
	};
	// Emaiで新規登録
	const signUpEmail = async () => {
		const authUser = await auth.createUserWithEmailAndPassword(email, password);
		// firestorageでの画像データの保存先
		let url = "";
		if (avatarImage) {
			// ＊＊ここからランダムなfileネームを作成 (firestorageでは同じファイル名で複数回アップロードすると以前のデータが消去される使用のため)
			const S =
				"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			const N = 16;
			const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
				.map((n) => S[n % S.length])
				.join("");
			const fileName = randomChar + "_" + avatarImage.name;
			// ＊＊ここまでランダムなfileネームを作成

			// firestorageに画像データをアップロード
			await storage.ref(`avatars/${fileName}`).put(avatarImage);
			// firestorageでの画像データの保存先urlを取得して変数に代入
			url = await storage.ref("avatars").child(fileName).getDownloadURL();
		}
		// createUserWithEmailAndPasswordのユーザー情報に対してdisplayNameとphotoUrlを加えてユーザー情報を更新
		await authUser.user?.updateProfile({
			displayName: username,
			photoURL: url,
		});
		// Reduxのグローバルステートのユーザー情報を更新
		dispatch(
			updateUserProfile({
				displayName: username,
				photoUrl: url,
			})
		);
	};

	return (
		<Grid container component="main" className={classes.root}>
			<CssBaseline />
			<Grid item xs={false} sm={4} md={7} className={classes.image} />
			<Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
				<div className={classes.paper}>
					<Avatar className={classes.avatar}>
						<LockOutlinedIcon />
					</Avatar>
					<Typography component="h1" variant="h5">
						{isLogin ? "Login" : "Register"}
					</Typography>
					<form className={classes.form} noValidate>
						{!isLogin && (
							// 新規登録画面
							<>
								<TextField
									variant="outlined"
									margin="normal"
									required
									fullWidth
									id="username"
									label="Username"
									name="username"
									autoComplete="username"
									autoFocus
									value={username}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										setUsername(e.target.value);
									}}
								/>
								<Box textAlign="center">
									<IconButton>
										<label>
											<AccountCircleIcon
												fontSize="large"
												className={
													// イメージが選択されているかでレイアウトを変更する
													avatarImage
														? styles.login_addIconLoaded
														: styles.login_addIcon
												}
											/>
											<input
												className={styles.login_hiddenIcon}
												type="file"
												onChange={onChangeImageHandler}
											/>
										</label>
									</IconButton>
								</Box>
							</>
						)}
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							value={email}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setEmail(e.target.value);
							}}
						/>
						<TextField
							variant="outlined"
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							value={password}
							onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
								setPassword(e.target.value);
							}}
						/>

						<Button
							disabled={
								// True時にdisabledが有効になる
								isLogin
									? // ログインフォーム
									  !email || password.length < 6
									: // 新規登録フォーム
									  !username || !email || password.length < 6 || !avatarImage
							}
							fullWidth
							variant="contained"
							color="primary"
							className={classes.submit}
							startIcon={<EmailIcon />}
							onClick={
								isLogin
									? async () => {
											try {
												await signInEmail();
											} catch (err: any) {
												alert(err.message);
											}
									  }
									: async () => {
											try {
												await signUpEmail();
											} catch (err: any) {
												alert(err.message);
											}
									  }
							}>
							{isLogin ? "Login" : "Register"}
						</Button>

						{/* グリッドで要素2つを横並び */}
						<Grid container>
							<Grid item xs>
								<span
									className={styles.login_reset}
									onClick={() => setOpenModal(true)}>
									Forgot password ?
								</span>
							</Grid>
							<Grid item>
								<span
									className={styles.login_toggleMode}
									onClick={() => setIsLogin(!isLogin)}>
									{isLogin ? "Create new account ?" : "Back to login"}
								</span>
							</Grid>
						</Grid>

						<Button
							fullWidth
							variant="contained"
							color="default"
							className={classes.submit}
							startIcon={<CameraIcon />}
							onClick={signInGoogle}>
							SignIn with Google
						</Button>
					</form>

          {/* パスワード再設定モーダル */}
					<Modal open={openModal} onClose={() => setOpenModal(false)}>
						<div style={getModalStyle()} className={classes.modal}>
							<div className={styles.login_modal}>
								<TextField
									InputLabelProps={{
										shrink: true,
									}}
									type="email"
									name="email"
									label="Reset E-mail"
									value={resetEmail}
									onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
										setResetEmail(e.target.value);
									}}
								/>
								<IconButton onClick={sendResetEmail}>
									<SendIcon />
								</IconButton>
							</div>
						</div>
					</Modal>
				</div>
			</Grid>
		</Grid>
	);
};
export default Auth;
