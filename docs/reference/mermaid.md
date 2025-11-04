graph TD
    Start([사용자 접속]) --> CheckAuth{로그인<br/>상태?}
    
    CheckAuth -->|No| SignInUp[회원가입/로그인<br/>Clerk]
    SignInUp --> CreateUser[Users 테이블에<br/>사용자 정보 저장]
    CreateUser --> Home
    
    CheckAuth -->|Yes| Home[홈 피드<br/>/]
    
    Home --> ViewFeed[게시물 피드<br/>시간 역순 정렬]
    ViewFeed --> InfiniteScroll{무한 스크롤<br/>10개씩 로드}
    InfiniteScroll --> ViewFeed
    
    ViewFeed --> PostAction1{게시물<br/>액션 선택}
    
    PostAction1 -->|좋아요| LikePost[❤️ 좋아요<br/>likes 테이블]
    LikePost --> LikeAnim[하트 애니메이션<br/>scale 효과]
    LikeAnim --> ViewFeed
    
    PostAction1 -->|더블탭| DoubleTap[이미지 더블탭<br/>큰 하트 등장]
    DoubleTap --> LikePost
    
    PostAction1 -->|댓글| CommentAction[💬 댓글 작성<br/>comments 테이블]
    CommentAction --> ViewFeed
    
    PostAction1 -->|상세보기| PostDetail[게시물 상세<br/>Desktop: 모달<br/>Mobile: 페이지]
    PostDetail --> DetailAction{상세<br/>액션}
    DetailAction -->|댓글 전체| ViewComments[전체 댓글 보기<br/>스크롤 가능]
    DetailAction -->|닫기| ViewFeed
    
    PostAction1 -->|삭제| DeleteCheck{본인<br/>게시물?}
    DeleteCheck -->|Yes| DeletePost[⋯ 메뉴<br/>게시물 삭제]
    DeletePost --> ViewFeed
    DeleteCheck -->|No| ViewFeed
    
    Home --> CreateNew[➕ 게시물 만들기<br/>Sidebar/BottomNav]
    CreateNew --> UploadModal[CreatePostModal<br/>열기]
    UploadModal --> SelectImage[이미지 선택<br/>최대 5MB]
    SelectImage --> PreviewImage[이미지 미리보기<br/>1:1 정사각형]
    PreviewImage --> WriteCaption[캡션 작성<br/>최대 2,200자]
    WriteCaption --> UploadStorage[Supabase Storage<br/>이미지 업로드]
    UploadStorage --> SavePost[posts 테이블<br/>게시물 저장]
    SavePost --> ViewFeed
    
    Home --> GoProfile[👤 프로필<br/>Sidebar/BottomNav]
    GoProfile --> ProfileCheck{프로필<br/>소유자?}
    
    ProfileCheck -->|내 프로필| MyProfile["/profile<br/>본인 프로필"]
    MyProfile --> ViewMyPosts[게시물 그리드<br/>3열 레이아웃]
    ViewMyPosts --> MyPostAction{게시물<br/>선택}
    MyPostAction -->|클릭| PostDetail
    MyPostAction -->|Hover| ShowStats[좋아요/댓글 수<br/>표시]
    
    ProfileCheck -->|타인 프로필| OtherProfile["/profile/userId<br/>다른 사용자 프로필"]
    OtherProfile --> ViewOtherPosts[게시물 그리드<br/>통계 정보]
    ViewOtherPosts --> FollowAction{팔로우<br/>상태?}
    
    FollowAction -->|미팔로우| FollowBtn[팔로우 버튼<br/>파란색]
    FollowBtn --> CreateFollow[follows 테이블<br/>팔로우 생성]
    CreateFollow --> FollowingBtn
    
    FollowAction -->|팔로우 중| FollowingBtn[팔로잉 버튼<br/>회색]
    FollowingBtn --> UnfollowHover{Hover<br/>언팔로우?}
    UnfollowHover -->|Yes| DeleteFollow[follows 테이블<br/>팔로우 삭제]
    DeleteFollow --> FollowBtn
    UnfollowHover -->|No| FollowingBtn
    
    ViewOtherPosts --> OtherPostAction{게시물<br/>선택}
    OtherPostAction --> PostDetail
    
    style Start fill:#e1f5ff
    style Home fill:#fff3cd
    style CreateNew fill:#d4edda
    style GoProfile fill:#f8d7da
    style LikePost fill:#ff6b9d
    style FollowBtn fill:#0095f6,color:#fff
    style SavePost fill:#28a745,color:#fff
