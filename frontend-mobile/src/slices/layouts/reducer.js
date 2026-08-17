import { createSlice } from "@reduxjs/toolkit";
//constants
import {
  layoutTypes,
  leftSidebarTypes,
  layoutModeTypes,
  layoutWidthTypes,
  layoutPositionTypes,
  topbarThemeTypes,
  leftsidbarSizeTypes,
  leftSidebarViewTypes,
  leftSidebarImageTypes,
  preloaderTypes,
  sidebarVisibilitytypes
} from "../../Components/constants/layout";

const getSavedLayoutMode = () => {
  try {
    const saved = localStorage.getItem("sadar_theme_mode") || localStorage.getItem("layoutMode");
    if (saved === "dark" || saved === "light") return saved;
  } catch (error) {
    void error;
  }
  return layoutModeTypes.LIGHTMODE;
};

export const initialState = {
  layoutType: layoutTypes.VERTICAL,
  leftSidebarType: leftSidebarTypes.LIGHT,
  layoutModeType: getSavedLayoutMode(),
  layoutWidthType: layoutWidthTypes.FLUID,
  layoutPositionType: layoutPositionTypes.FIXED,
  topbarThemeType: topbarThemeTypes.LIGHT,
  leftsidbarSizeType: leftsidbarSizeTypes.DEFAULT,
  leftSidebarViewType: leftSidebarViewTypes.DEFAULT,
  leftSidebarImageType: leftSidebarImageTypes.NONE,
  preloader: preloaderTypes.DISABLE,
  sidebarVisibilitytype: sidebarVisibilitytypes.SHOW
};

const LayoutSlice = createSlice({
  name: 'LayoutSlice',
  initialState,
  reducers: {
    changeLayoutAction(state, action) {
      state.layoutType = action.payload;
    },
    changeLayoutModeAction(state, action) {
      state.layoutModeType = action.payload;
      try {
        localStorage.setItem("sadar_theme_mode", action.payload);
        localStorage.setItem("layoutMode", action.payload);
      } catch (error) {
        void error;
      }
    },
    changeSidebarThemeAction(state, action) {
      state.leftSidebarType = action.payload;
    },
    changeLayoutWidthAction(state, action) {
      state.layoutWidthType = action.payload;
    },
    changeLayoutPositionAction(state, action) {
      state.layoutPositionType = action.payload;
    },
    changeTopbarThemeAction(state, action) {
      state.topbarThemeType = action.payload;
    },
    changeLeftsidebarSizeTypeAction(state, action) {
      state.leftsidbarSizeType = action.payload;
    },
    changeLeftsidebarViewTypeAction(state, action) {
      state.leftSidebarViewType = action.payload;
    },
    changeSidebarImageTypeAction(state, action) {
      state.leftSidebarImageType = action.payload;
    },
    changePreLoaderAction(state, action) {
      state.preloader = action.payload;
    },
    changeSidebarVisibilityAction(state, action) {
      state.sidebarVisibilitytype = action.payload;
    }
  }
});

export const {
  changeLayoutAction,
  changeLayoutModeAction,
  changeSidebarThemeAction,
  changeLayoutWidthAction,
  changeLayoutPositionAction,
  changeTopbarThemeAction,
  changeLeftsidebarSizeTypeAction,
  changeLeftsidebarViewTypeAction,
  changeSidebarImageTypeAction,
  changePreLoaderAction,
  changeSidebarVisibilityAction
} = LayoutSlice.actions;

export default LayoutSlice.reducer;