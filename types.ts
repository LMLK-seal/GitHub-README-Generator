
export interface ProjectFile {
  name: string;
  path: string;
  content: string;
}

export enum AppState {
  IDLE,
  LOADING_FILES,
  FILES_LOADED,
  GENERATING,
  SUCCESS,
  ERROR,
}
