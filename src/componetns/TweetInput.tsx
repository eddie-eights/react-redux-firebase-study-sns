import React, { useState } from "react";
import styles from "./TweetInput.module.css";
import { useSelector } from "react-redux";
import { selectUser } from "../features/userSlice";
import { auth, storage, db } from "../firebase";
import { Avatar, Button, IconButton, styled } from "@material-ui/core";
import firebase from "firebase/app";
import AddAPhotoIcon from "@material-ui/icons/AddAPhoto";

const TweetInput: React.FC = () => {
	const user = useSelector(selectUser);
	const [tweetImage, setTweetImage] = useState<File | null>(null);
	const [tweetMsg, setTweetMsg] = useState("");

	const onChangeImageHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files![0]) {
			//<- 「!」nullではないと宣言
			setTweetImage(e.target.files![0]);
			e.target.value = "";
		}
	};

	const sendTweet = (e: any) => {
		e.preventDefault(); //<- tweetボタン押した際にブラウザがリフレッシュされるのを防ぐ
		// tweer内容に画像が含まれている場合
		if (tweetImage) {
			// ＊＊ここからランダムなfileネームを作成
			const S =
				"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
			const N = 16;
			const randomChar = Array.from(crypto.getRandomValues(new Uint32Array(N)))
				.map((n) => S[n % S.length])
				.join("");
			const fileName = randomChar + "_" + tweetImage.name;
			// ＊＊ここまでランダムなfileネームを作成

			const uploadTweetImage = storage
				.ref(`images/${fileName}`)
				.put(tweetImage);

			// ストレージに対してステートの変化があった場合の処理f
			uploadTweetImage.on(
				//<- 第1引数:アップロード処理の進捗管理、 第2引数:エラー処理、第3引数:正常終了時の処理
				firebase.storage.TaskEvent.STATE_CHANGED,
				() => {},
				(err) => {
					alert(err.message);
				},
				async () => {
					await storage
						.ref("images")
						.child(fileName)
						.getDownloadURL()
						.then(async (url) => {
							await db.collection("posts").add({
								avatar: user.photoUrl,
								image: url,
								text: tweetMsg,
								timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
								username: user.displayName,
							});
						});
				}
			);
		}
		// tweet内容がテキストのみの場合
		else {
			db.collection("posts").add({
				avatar: user.photoUrl,
				image: "", // <- イメージは空で指定
				text: tweetMsg,
				timeStamp: firebase.firestore.FieldValue.serverTimestamp(),
				username: user.displayName,
			});
		}
		setTweetImage(null);
		setTweetMsg("");
	};

	return (
		<>
			<form onSubmit={sendTweet}>
				<div className={styles.tweet_form}>
					<Avatar
						className={styles.tweet_avatar}
						src={user.photoUrl}
						onClick={async () => {
							await auth.signOut();
						}}
					/>
					<input
						className={styles.tweet_input}
						placeholder="今何してる？"
						type="text"
						autoFocus
						value={tweetMsg}
						onChange={(e) => {
							setTweetMsg(e.target.value);
						}}
					/>
					<IconButton>
						<label>
							<AddAPhotoIcon
								className={
									tweetImage ? styles.tweet_addIconLoaded : styles.tweet_addIcon
								}
							/>
							<input
								className={styles.tweet_hiddenIcon}
								type="file"
								onChange={onChangeImageHandler}
							/>
						</label>
					</IconButton>
				</div>
				<Button
					type="submit"
					disabled={!tweetMsg}
					className={
						tweetMsg ? styles.tweet_sendBtn : styles.tweet_sendDisableBtn
					}>
					ツイート
				</Button>
			</form>
		</>
	);
};

export default TweetInput;