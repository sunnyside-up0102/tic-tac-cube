import React, { useState } from "react";

export default function TitleScreen({ onStart, currentTheme, setTheme }) {
  const [showRules, setShowRules] = useState(false);
  const [page, setPage] = useState(0);

  const imgStyle = {
    width: "100%",
    height: "160px",
    objectFit: "cover",
    borderRadius: "12px",
    border: `2px solid ${currentTheme.uiBorder}88`,
    margin: "15px auto",
    display: "block",
    boxShadow: "0 8px 16px rgba(0,0,0,0.5)",
    backgroundColor: "rgba(0,0,0,0.2)",
  };

  const pages = [
    {
      title: "1. 목표: 3줄 잇기",
      content: (
        <>
          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#ffccbc", fontSize: "1.2rem" }}>
              "한 면에서 가로·세로·대각선 3칸!"
            </strong>
            <br />
            <br />
            큐브의 <strong>겉면(총 6개 면)</strong> 중 하나에서, 내 표식(X 또는
            O)으로 <strong>3칸을 한 줄</strong>로 먼저 완성하면 승리합니다.
          </div>
          <img
            src="/images/rulebook_1.png"
            alt="목표 설명"
            style={imgStyle}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              padding: "12px",
              borderRadius: "8px",
              textAlign: "left",
              border: `1px solid ${currentTheme.uiBorder}44`,
              fontSize: "0.9rem",
            }}
          >
            <strong style={{ color: "#fff9c4" }}>🎮 조작법</strong>
            <ul
              style={{ margin: "5px 0 0 20px", padding: 0, lineHeight: "1.8" }}
            >
              <li>
                🖱️ <strong>좌클릭:</strong> 큐브 겉면을 클릭해서 표식 놓기
              </li>
              <li>
                🖱️ <strong>우클릭 드래그:</strong> 카메라 회전
              </li>
              <li>
                🖱️ <strong>휠:</strong> 확대 / 축소
              </li>
            </ul>
          </div>
        </>
      ),
    },
    {
      title: "2. 겉면에만 표식",
      content: (
        <>
          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#c8e6c9", fontSize: "1.2rem" }}>
              "보이는 면에만 둘 수 있습니다!"
            </strong>
            <br />
            <br />
            큐브는 3×3×3 = 27개 블록으로 이루어져 있지만, 표식은{" "}
            <strong>바깥에서 보이는 6개 면(각 3×3)</strong>에만 놓을 수 있어요.
            내부 블록은 완전히 비어있습니다.
          </div>
          <img
            src="/images/rulebook_2.png"
            alt="겉면 설명"
            style={imgStyle}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div
            style={{
              background: "rgba(255,215,0,0.1)",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #ffd700",
              fontSize: "0.9rem",
            }}
          >
            <strong style={{ color: "#ffd700" }}>💡 미리보기</strong>
            <br />
            마우스를 면 위에 올리면, 그 자리에 내 표식이{" "}
            <strong>반투명하게 미리 보입니다.</strong>
            <br />
            <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
              이미 표식이 있는 면에는 놓을 수 없어요.
            </span>
          </div>
        </>
      ),
    },
    {
      title: "3. 레이어 회전",
      content: (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <div>
            오른쪽 <strong>CONTROL BOARD</strong>에서 버튼을 누르면 선택한
            층(레이어)을 <strong>90도 회전</strong>시킬 수 있습니다.
          </div>
          <img
            src="/images/rulebook_3.png"
            alt="회전 설명"
            style={{ ...imgStyle, height: "120px" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div
            style={{
              padding: "10px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
            }}
          >
            <strong style={{ color: "#90caf9" }}>SIDE / TOP / FRONT</strong>
            <br />세 방향(X·Y·Z축) 중 원하는 층을 골라 시계 ⟳ 또는 반시계 ⟲ 로
            돌릴 수 있어요.
          </div>
          <div
            style={{
              padding: "10px",
              background: "rgba(255,255,255,0.05)",
              borderRadius: "8px",
            }}
          >
            <strong style={{ color: "#ce93d8" }}>호버 미리보기</strong>
            <br />
            버튼 위에 마우스를 올리면 회전 방향을{" "}
            <strong>살짝 기울어진 모습</strong>으로 미리 확인할 수 있어요.
          </div>
          <div
            style={{
              padding: "10px",
              background: "rgba(255,87,34,0.1)",
              border: "1px solid #ff5722",
              borderRadius: "8px",
            }}
          >
            ⚠️ 회전하면 <strong>턴이 상대에게 넘어갑니다.</strong> 신중하게
            사용하세요!
          </div>
        </div>
      ),
    },
    {
      title: "4. 마지막 팁",
      content: (
        <>
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ color: "#42a5f5", fontSize: "1.2rem" }}>
              🏆 승리 조건
            </strong>
            <br />
            <br />
            6개 면 중 <strong>어느 한 면에서든</strong> 가로·세로·대각선으로
            3칸을 완성하면 이깁니다. 상대가 다른 면을 노리는 동안 내가 먼저 한
            면을 완성하는 것이 핵심이에요.
          </div>
          <img
            src="/images/rulebook_4.png"
            alt="팁 설명"
            style={imgStyle}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div style={{ marginBottom: "16px" }}>
            <strong style={{ color: "#ffb74d", fontSize: "1.1rem" }}>
              🔄 회전의 전략
            </strong>
            <br />
            레이어를 돌리면 그 면의 표식 배치가 바뀝니다. 상대의 줄을 끊거나, 내
            줄을 유리하게 재배치하는 전략으로 활용하세요.
          </div>
          <div
            style={{
              fontStyle: "italic",
              borderTop: `1px solid ${currentTheme.uiBorder}`,
              paddingTop: "15px",
              color: "#fff9c4",
              fontSize: "1rem",
            }}
          >
            "승리의 열쇠는 <strong>면 선택</strong>과{" "}
            <strong>회전 타이밍</strong>입니다!"
          </div>
        </>
      ),
    },
  ];

  const containerStyle = {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "transparent",
    color: currentTheme.textColor,
    fontFamily: "'Georgia', 'Times New Roman', serif",
    position: "relative",
    zIndex: 100,
    transition: "color 0.3s",
  };
  const boxStyle = {
    background: "rgba(0,0,0,0.85)",
    padding: "30px 40px",
    borderRadius: "20px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
    textAlign: "center",
    width: "500px",
    height: "650px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: `2px solid ${currentTheme.uiBorder}`,
    backdropFilter: "blur(10px)",
    transition: "border 0.3s",
  };
  const btnStyle = {
    padding: "15px 40px",
    fontSize: "1.2rem",
    background: currentTheme.uiBorder,
    color: "#1a0f0a",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    fontWeight: "bold",
    boxShadow: "0 4px 15px rgba(0,0,0,0.3)",
    transition: "transform 0.1s, background 0.3s",
    fontFamily: "'Georgia', serif",
  };
  const navBtnStyle = {
    background: "transparent",
    border: `1px solid ${currentTheme.uiBorder}`,
    color: currentTheme.textColor,
    padding: "10px 20px",
    cursor: "pointer",
    borderRadius: "30px",
    fontSize: "0.9rem",
    transition: "all 0.2s",
  };

  const handleNext = () => {
    if (page < pages.length - 1) setPage(page + 1);
    else onStart();
  };
  const handlePrev = () => {
    if (page > 0) setPage(page - 1);
  };

  if (!showRules) {
    return (
      <div style={containerStyle}>
        <div style={{ ...boxStyle, height: "auto", padding: "60px" }}>
          <div
            style={{
              fontSize: "1rem",
              opacity: 0.7,
              letterSpacing: "5px",
              marginBottom: "15px",
              textTransform: "uppercase",
            }}
          >
            3D Strategy Puzzle
          </div>
          <h1
            style={{
              fontSize: "4.5rem",
              margin: "0 0 20px 0",
              textShadow: "4px 4px 0px rgba(0,0,0,0.5)",
              fontFamily: "'Playfair Display', serif",
              lineHeight: "1",
            }}
          >
            Tic Tac
            <br />
            Cube
          </h1>
          <p
            style={{
              fontStyle: "italic",
              opacity: 0.8,
              marginBottom: "40px",
              fontSize: "1.1rem",
            }}
          >
            Theme: {currentTheme.name}
          </p>
          <button
            style={btnStyle}
            onClick={() => setShowRules(true)}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            onMouseDown={(e) => (e.target.style.transform = "scale(0.95)")}
            onMouseUp={(e) => (e.target.style.transform = "scale(1.05)")}
          >
            GAME START
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={boxStyle}>
        <div
          style={{
            borderBottom: `1px solid ${currentTheme.uiBorder}`,
            paddingBottom: "15px",
            marginBottom: "15px",
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: "1.8rem",
              color: currentTheme.uiBorder,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            {pages[page].title}
          </h2>
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            fontSize: "1rem",
            lineHeight: "1.5",
            overflowY: "auto",
          }}
        >
          {pages[page].content}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1px solid ${currentTheme.uiBorder}`,
            paddingTop: "20px",
            marginTop: "15px",
          }}
        >
          <button
            style={{
              ...navBtnStyle,
              opacity: page === 0 ? 0 : 1,
              pointerEvents: page === 0 ? "none" : "auto",
            }}
            onClick={handlePrev}
          >
            &lt; Prev
          </button>
          <div style={{ display: "flex", gap: "8px" }}>
            {pages.map((_, idx) => (
              <div
                key={idx}
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background:
                    page === idx
                      ? currentTheme.uiBorder
                      : "rgba(255,255,255,0.2)",
                  transition: "background 0.3s",
                }}
              />
            ))}
          </div>
          <button
            style={page === pages.length - 1 ? btnStyle : navBtnStyle}
            onClick={handleNext}
          >
            {page === pages.length - 1 ? "LET'S GO!" : "Next >"}
          </button>
        </div>
      </div>
    </div>
  );
}
