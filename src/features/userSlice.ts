import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

// updateUserProfileで受けるためのUser型を定義
interface User {
	displayName: string;
	photoUrl: string;
}

export const userSlice = createSlice({
	name: "user",
	initialState: {
		user: { uid: "", photoUrl: "", displayName: "" },
	},
	reducers: {
		login: (state, action) => {
			// firebaseで取得したユーザー情報をsateに反映
			state.user = action.payload;
		},
		logout: (state) => {
			// ユーザー情報を初期化
			state.user = { uid: "", photoUrl: "", displayName: "" };
		},
		updateUserProfile: (state, action: PayloadAction<User>) => {
			// displayNameと画像情報を更新
			state.user.displayName = action.payload.displayName;
			state.user.photoUrl = action.payload.photoUrl;
		},
	},
});

export const { login, logout, updateUserProfile } = userSlice.actions;
export const selectUser = (state: RootState) => state.user.user;

export default userSlice.reducer;
