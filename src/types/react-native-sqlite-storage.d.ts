declare module 'react-native-sqlite-storage' {
  import { NativeModules } from 'react-native';

  export interface Transaction {
    executeSql: (sqlStatement: string, args?: any[], callback?: Function, errorCallback?: Function) => void;
  }

  export interface ResultSet {
    rows: {
      length: number;
      item: (index: number) => any;
    };
  }

  export interface SQLiteDatabase {
    executeSql: (
      sqlStatement: string,
      args?: any[],
    ) => Promise<ResultSet[]>;
    transaction: (cb: (tx: Transaction) => void) => void;
    close: () => Promise<void>;
  }

  export interface OpenDatabaseOptions {
    name: string;
    location?: string;
  }

  export function openDatabase(options: OpenDatabaseOptions): Promise<SQLiteDatabase>;
  export function DEBUG(enable: boolean): void;
  export function enablePromise(enable: boolean): void;

  const SQLite: {
    openDatabase: typeof openDatabase;
    DEBUG: typeof DEBUG;
    enablePromise: typeof enablePromise;
  };

  export default SQLite;
} 