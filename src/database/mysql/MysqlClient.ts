import mysql from 'mysql';
import { DatabaseClient, ExecuteResult } from '../DatabaseClient';

export class MysqlClient extends DatabaseClient {
  private _client: mysql.PoolConnection;
  public get Client(): mysql.PoolConnection {
    return this._client;
  }

  constructor(client: mysql.PoolConnection) {
    super();
    this._client = client;
  }

  async ExecuteAsync<TResult = any>(sql: string, ...args: Array<string | number | boolean>): Promise<ExecuteResult<TResult>> {
    const fullSql = mysql.format(sql, args);
    return new Promise((resolve, reject) => {
      this.Client.query(fullSql, (err, result) => {
        // PS:这个回调很奇怪,reject调用之后还会继续执行下面的代码
        if (err || !result) {
          reject(err);
        } else {
          if (Array.isArray(result)) {
            resolve({
              rowCount: result.length,
              rows: result,
            });
          } else {
            resolve({
              rowCount: result.affectedRows,
              rows: [],
            });
          }
        }
      });
    });
  }

  BeginTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.Client.beginTransaction((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  Rollback(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.Client.rollback((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  Commit(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.Client.commit((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  Dispose(): void {
    if (this._client) {
      try {
        this._client.release();
      } catch (error) {
        this.Logger.LogWarn('Mysql Client 存在重复释放的问题,请不要多次调用[Dispose]');
      }
    }
  }
}