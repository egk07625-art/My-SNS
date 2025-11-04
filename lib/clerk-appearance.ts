import type { Appearance } from "@clerk/types";

/**
 * Clerk Appearance 설정
 * Instagram 스타일의 디자인 시스템 적용
 */
export const clerkAppearance: Appearance = {
  elements: {
    // 루트 컨테이너
    rootBox: {
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    },
    // 모달/카드 스타일
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      boxShadow: "none",
      border: "1px solid #dbdbdb",
    },
    // 헤더
    headerTitle: {
      fontSize: "24px",
      fontWeight: "600",
      color: "#262626",
    },
    headerSubtitle: {
      fontSize: "14px",
      color: "#8e8e8e",
    },
    // 입력 필드
    formFieldInput: {
      backgroundColor: "#fafafa",
      borderColor: "#dbdbdb",
      borderRadius: "4px",
      fontSize: "14px",
      color: "#262626",
      padding: "9px 12px",
      "&:focus": {
        borderColor: "#a8a8a8",
        backgroundColor: "#ffffff",
      },
    },
    formFieldLabel: {
      fontSize: "12px",
      fontWeight: "600",
      color: "#262626",
    },
    // 버튼
    formButtonPrimary: {
      backgroundColor: "#0095f6",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      borderRadius: "4px",
      padding: "5px 9px",
      "&:hover": {
        backgroundColor: "#1877f2",
      },
      "&:disabled": {
        backgroundColor: "#b2dffc",
      },
    },
    formButtonSecondary: {
      backgroundColor: "transparent",
      color: "#0095f6",
      fontSize: "14px",
      fontWeight: "600",
      border: "none",
      "&:hover": {
        backgroundColor: "transparent",
        color: "#1877f2",
      },
    },
    // 링크
    footerActionLink: {
      color: "#0095f6",
      fontSize: "14px",
      fontWeight: "600",
      "&:hover": {
        color: "#1877f2",
      },
    },
    // 텍스트
    formFieldErrorText: {
      fontSize: "12px",
      color: "#ed4956",
    },
    formFieldSuccessText: {
      fontSize: "12px",
      color: "#0095f6",
    },
    // 소셜 버튼
    socialButtonsBlockButton: {
      borderColor: "#dbdbdb",
      borderRadius: "4px",
      fontSize: "14px",
      fontWeight: "600",
      color: "#262626",
      "&:hover": {
        backgroundColor: "#fafafa",
      },
    },
    // 구분선
    dividerLine: {
      backgroundColor: "#dbdbdb",
    },
    dividerText: {
      fontSize: "13px",
      color: "#8e8e8e",
    },
  },
  variables: {
    colorPrimary: "#0095f6",
    colorBackground: "#ffffff",
    colorInputBackground: "#fafafa",
    colorInputText: "#262626",
    colorText: "#262626",
    colorTextSecondary: "#8e8e8e",
    colorDanger: "#ed4956",
    borderRadius: "4px",
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  },
};

