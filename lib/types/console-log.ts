/**
 * @file lib/types/console-log.ts
 * @description 개발자 콘솔 로그 타입 정의
 *
 * 개발자 콘솔 뷰어에서 사용하는 로그 관련 타입들을 정의합니다.
 */

/**
 * 로그 타입
 */
export type LogType = 'log' | 'info' | 'warn' | 'error' | 'group' | 'groupEnd';

/**
 * 로그 필터 타입
 */
export type LogFilter = 'all' | 'log' | 'info' | 'warn' | 'error';

/**
 * 로그 항목 인터페이스
 */
export interface LogEntry {
  /** 로그 고유 ID */
  id: string;
  /** 로그 타입 */
  type: LogType;
  /** 로그 메시지 */
  message: string;
  /** 타임스탬프 */
  timestamp: Date;
  /** 그룹 ID (그룹 로그인 경우) */
  groupId?: string;
  /** 그룹 중첩 레벨 */
  level?: number;
  /** 추가 데이터 (객체, 배열 등) */
  data?: unknown[];
}

/**
 * 로그 그룹 인터페이스
 */
export interface LogGroup {
  /** 그룹 ID */
  id: string;
  /** 그룹 시작 로그 */
  start: LogEntry;
  /** 그룹 내 로그들 */
  logs: LogEntry[];
  /** 그룹 종료 로그 */
  end?: LogEntry;
  /** 중첩 레벨 */
  level: number;
  /** 그룹이 펼쳐져 있는지 여부 */
  expanded: boolean;
}



