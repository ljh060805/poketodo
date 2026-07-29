// ==========================================
// 🔥 Firebase 서버 연결 (항상 1순위로 실행!)
// ==========================================
// 1. 구글 서버에서 필요한 도구들을 인터넷으로 직접 가져옵니다.
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// 2. 유저님의 고유한 금고 열쇠 정보입니다.
const firebaseConfig = {
  apiKey: "AIzaSyDKR64gn7RxfoiCltiEPVFR-7oofasNigg",
  authDomain: "poketode.firebaseapp.com",
  projectId: "poketode",
  storageBucket: "poketode.firebasestorage.app",
  messagingSenderId: "977484593642",
  appId: "1:977484593642:web:27d710efb40cc0dace1a93"
};

// 3. 열쇠를 꽂아 서버를 켜고, 로그인(auth)과 공용 금고(db) 기능을 활성화합니다!
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // 🌟 로그인 담당 경비원
export const db = getFirestore(app); // 🌟 데이터 저장소 (공용 금고)

// ==========================================
// 🌟 1. 데이터 불러오기 (Local Storage) - (원래 있던 코드 시작)
// ==========================================
// let myMonsterballs = parseInt(localStorage.getItem('myMonsterballs')) || 0;
// ... (이하 기존 코드 동일)

// ==========================================
// 🌟 1. 데이터 불러오기 (Local Storage)
// ==========================================
let myMonsterballs = parseInt(localStorage.getItem('myMonsterballs')) || 0;
let myTodos = JSON.parse(localStorage.getItem('myTodos')) || []; 

// 🌟 [추가] 피카츄 기본 이미지 (공식 API의 고화질 이미지 인터넷 링크)
const pikachuImgUrl = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png";

// 🌟 [수정] 도감 불러오기 & 신규 유저에게 피카츄 선물!
let myPokedex = JSON.parse(localStorage.getItem('myPokedex'));
if (!myPokedex || myPokedex.length === 0) {
  // 도감이 아예 비어있다면(처음 접속했다면) 피카츄 1마리를 넣어줍니다.
  myPokedex = [{ id: 25, name: '피카츄', img: pikachuImgUrl, count: 1 }];
  localStorage.setItem('myPokedex', JSON.stringify(myPokedex));
}

// 🌟 [수정] 내 메인 파트너 정보 불러오기 (없으면 인터넷에서 피카츄 사진 가져오기!)
let myPartner = JSON.parse(localStorage.getItem('myPartner')) || { name: '피카츄', img: pikachuImgUrl };

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('monsterballCount').innerText = myMonsterballs;
  
  // 🌟 화면이 켜지자마자 전투 필드의 내 포켓몬을 파트너로 바꿔주기
  const myPokemonImg = document.querySelector('.my-pokemon-area img');
  const myPokemonName = document.getElementById('myPokemonName');

  if (myPokemonImg) myPokemonImg.src = myPartner.img;
  if (myPokemonName) myPokemonName.innerText = myPartner.name;
});

function saveData() {
  localStorage.setItem('myMonsterballs', myMonsterballs);
  localStorage.setItem('myPokedex', JSON.stringify(myPokedex));
  localStorage.setItem('myTodos', JSON.stringify(myTodos)); 
  // 🌟 내 파트너 정보도 같이 저장!
  localStorage.setItem('myPartner', JSON.stringify(myPartner)); 
}


// ==========================================
// 1. DOM 요소 및 전역 변수 설정
// ==========================================

// 탭 요소
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// 투두 요소
const todoInput = document.getElementById('todoInput');
const addTodoBtn = document.getElementById('addTodoBtn');
const todoList = document.getElementById('todoList');
const difficultySelect = document.getElementById('difficultySelect');

// 전투 및 타이머 요소
const startBtn = document.getElementById('battleBtn');
const timeBar = document.getElementById('timeBarFill');
const timeText = document.getElementById('timeText');
const wildHpFill = document.getElementById('wildHpFill');
const wildHPText = document.getElementById('wildHpText');

// 게임 상태 관리 변수
let total = 5; 
let remained = 5; 
let current = null; 
let maxHP = 60;
let currentHP = 60;
let 현재진행중인할일버튼 = null; // 지금 어떤 퀘스트를 진행 중인지 기억할 상자


// ==========================================
// 2. 탭 메뉴 전환 기능
// ==========================================
tabBtns.forEach(function(btn) {
  btn.addEventListener('click', function() {
    tabBtns.forEach(function(item) {
      item.classList.remove('active');
    });

    tabContents.forEach(function(content){
      content.classList.remove('active');
    });

    btn.classList.add('active');
    const targetId = btn.getAttribute('data-tab'); 
    document.getElementById(targetId).classList.add('active');
  });
});

// ==========================================
// 3. 날짜 조작 및 투두 리스트 기능
// ==========================================

// --- 날짜 세팅 ---
const datePicker = document.getElementById('datePicker');
const prevDateBtn = document.getElementById('prevDateBtn');
const nextDateBtn = document.getElementById('nextDateBtn');

// 오늘 날짜를 'YYYY-MM-DD' 형태로 예쁘게 만들기
function getFormatDate(dateObj) {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

let currentDate = getFormatDate(new Date()); // 기본값: 오늘
datePicker.value = currentDate; // 달력에 오늘 날짜 표시

// 날짜 변경 이벤트 1: 달력에서 직접 날짜를 클릭했을 때
datePicker.addEventListener('change', function() {
  currentDate = this.value;
  renderTodos(); // 바뀐 날짜의 할 일 불러오기!
});

// 날짜 변경 이벤트 2: 왼쪽(과거) 버튼 눌렀을 때
prevDateBtn.addEventListener('click', function() {
  const d = new Date(currentDate);
  d.setDate(d.getDate() - 1);
  currentDate = getFormatDate(d);
  datePicker.value = currentDate;
  renderTodos();
});

// 날짜 변경 이벤트 3: 오른쪽(미래) 버튼 눌렀을 때
nextDateBtn.addEventListener('click', function() {
  const d = new Date(currentDate);
  d.setDate(d.getDate() + 1);
  currentDate = getFormatDate(d);
  datePicker.value = currentDate;
  renderTodos();
});

// --- 🌟 핵심 화면 그리기 함수 🌟 ---
function renderTodos() {
  todoList.innerHTML = ''; // 화면 일단 깨끗하게 지우기

  // 전체 할 일(myTodos) 중에서 '현재 선택된 날짜'와 똑같은 것만 골라내기
  const todayTodos = myTodos.filter(todo => todo.date === currentDate);

  if (todayTodos.length === 0) {
    todoList.innerHTML = '<p style="text-align:center; color:#999; margin-top:20px;">이 날짜엔 등록된 퀘스트가 없습니다.</p>';
    return;
  }

  // 골라낸 할 일들을 하나씩 화면에 카드(li)로 만들어주기
  todayTodos.forEach((todo) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div class="todo-left">
        <input type="checkbox" class="todo-check" ${todo.isCompleted ? 'checked disabled' : ''}>
        <span class="todo-diff ${todo.difficulty}">${todo.diffText}</span>
        <span class="todo-text" style="${todo.isCompleted ? 'text-decoration: line-through; color: #999;' : ''}">${todo.text}</span>
      </div>
      <div class="todo-right">
        <!-- 🌟 이 부분이 빠져있으면 화면에 연필이 안 보입니다! 🌟 -->
        <button type="button" class="todo-edit-btn" ${todo.isCompleted ? 'disabled style="opacity: 0.5;"' : ''}>✏️</button>
      <div class="todo-right">
        <button type="button" class="todo-battle-btn" 
          data-time="${todo.time}" data-hp="${todo.hp}" data-diff="${todo.difficulty}"
          data-pokename="${todo.pokeName}" data-pokeimg="${todo.pokeImg}"
          ${todo.isCompleted ? 'disabled style="opacity: 0.5;"' : ''}>⚔️ 전투</button>
        <button type="button" class="todo-delete-btn">❌</button>
      </div>
    `;

    // 각 버튼 기능 연결
    const 체크박스 = li.querySelector('.todo-check');
    const 삭제버튼 = li.querySelector('.todo-delete-btn');
    const 전투버튼 = li.querySelector('.todo-battle-btn');
    const 수정버튼 = li.querySelector('.todo-edit-btn');

    if (!todo.isCompleted) { 
      수정버튼.addEventListener('click', function() {
        console.log("✏️ 수정 버튼 클릭됨! 대상:", todo.text); 

        document.getElementById('editTodoInput').value = todo.text;
        document.getElementById('editDifficultySelect').value = todo.difficulty || 'easy';
        document.getElementById('editSaveBtn').setAttribute('data-id', todo.id);
        
        const editModal = document.getElementById('editModal');
        if (editModal) {
          editModal.classList.remove('hidden');
        } else {
          alert('앗! HTML에서 editModal을 찾을 수 없습니다.');
        }
      });
    }

    // [기능 A] 완료(체크) 기능
    if (!todo.isCompleted) {
      체크박스.addEventListener('change', function() {
        if (체크박스.checked) {
          let 진짜완료 = confirm('정말 할 일을 마치셨나요?');
          if (진짜완료) {
            let 획득볼 = todo.difficulty === 'hard' ? 3 : (todo.difficulty === 'normal' ? 2 : 1);
            myMonsterballs += 획득볼;
            
            // 데이터 베이스 업데이트
            todo.isCompleted = true; 
            saveData();
            renderTodos(); // 화면 다시 그리기! (줄 찍 긋기)

            const ballCountUI = document.getElementById('monsterballCount');
            ballCountUI.innerText = myMonsterballs;
            ballCountUI.classList.add('reward-bump');
            setTimeout(() => ballCountUI.classList.remove('reward-bump'), 1000);
            
            alert(`✅ 퀘스트 완료! 전리품으로 몬스터볼 ${획득볼}개를 획득했습니다!`);
          } else {
            체크박스.checked = false;
          }
        }
      });
    }

    // [기능 B] 삭제 기능
    삭제버튼.addEventListener('click', function() {
      // 전체 명단에서 고유 ID가 똑같은 걸 찾아서 완전히 지우기
      const originalIndex = myTodos.findIndex(t => t.id === todo.id);
      myTodos.splice(originalIndex, 1);
      saveData();
      renderTodos(); // 화면에서 사라지게 새로고침
    });

// [기능 C] 전투 기능 (기존과 동일)
    전투버튼.addEventListener('click', function() {
      document.getElementById('wildPokemonName').innerText = `야생의 ${todo.pokeName}`;
      document.getElementById('wildPokemon').src = todo.pokeImg;
      
      // 🌟 [추가] 퀘스트를 선택했으니 메인 전투 버튼의 잠금을 풀어줍니다!
      startBtn.disabled = false;
      startBtn.style.opacity = '1';
      startBtn.innerText = '▶ 전투 시작';
      
      if (current !== null) { clearInterval(current); current = null; }
      현재진행중인할일버튼 = 전투버튼;
      
      total = Number(전투버튼.getAttribute('data-time'));
      remained = total;
      maxHP = Number(전투버튼.getAttribute('data-hp'));
      currentHP = maxHP;

      let min = Math.floor(remained / 60); let sec = remained % 60;
      timeText.innerText = (min < 10 ? '0' + min : min) + ':' + (sec < 10 ? '0' + sec : sec);
      timeBar.style.width = '100%'; wildHpFill.style.width = '100%';
      wildHPText.innerText = currentHP + ' / ' + maxHP;

      alert(`[${todo.diffText}] 난이도의 '${todo.text}' 퀘스트로 타겟을 변경했습니다!`);
    });

    todoList.appendChild(li);
  });
}

// --- 할 일 새롭게 등록하기 (버튼 클릭) ---
addTodoBtn.addEventListener('click', async function() {
  const text = todoInput.value;
  if (text === '') { alert('할 일을 먼저 입력해 주세요!'); return; }

  const 선택된난이도 = difficultySelect.value;
  let 난이도글자 = ''; let 목표시간 = 0; let 목표체력 = 0;
  if (선택된난이도 === 'easy') { 난이도글자 = '하'; 목표시간 = 3600; 목표체력 = 60; }
  else if (선택된난이도 === 'normal') { 난이도글자 = '중'; 목표시간 = 7200; 목표체력 = 120; }
  else if (선택된난이도 === 'hard') { 난이도글자 = '상'; 목표시간 = 10800; 목표체력 = 180; }

  todoInput.placeholder = "포켓몬 탐색 중..."; 
  const taskPokemon = await fetchRandomPokemon(false);
  todoInput.placeholder = "할 일 입력 ..."; 

  // 🌟 화면에 바로 그리지 않고 일기장(데이터)에 저장합니다!
  const newTodo = {
    id: Date.now(),          // 고유 식별 번호 (삭제할 때 필요)
    date: currentDate,       // 🌟 현재 선택된 날짜에 저장!
    text: text,
    difficulty: 선택된난이도,
    diffText: 난이도글자,
    time: 목표시간,
    hp: 목표체력,
    pokeName: taskPokemon.name,
    pokeImg: taskPokemon.img,
    isCompleted: false       // 처음엔 미완료 상태
  };

  myTodos.push(newTodo); // 명단에 추가
  saveData();            // 저장 요정 소환
  renderTodos();         // 바뀐 명단으로 화면 다시 그리기!

  todoInput.value = '';
});

// 화면이 처음 켜질 때 오늘 날짜의 할 일들을 그려줍니다.
renderTodos();

// 초기 화면 세팅: 아무 할 일도 선택하지 않았을 때의 야생 포켓몬 자리
document.getElementById('wildPokemonName').innerText = "타겟 탐색 대기 중...";
document.getElementById('wildPokemon').src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";

// 🌟 [수정] 앱이 켜졌을 땐 퀘스트가 없으니 전투 버튼을 눌러도 작동 안 하게 잠가둡니다!
startBtn.disabled = true;
startBtn.style.opacity = '0.5';
startBtn.innerText = '타겟을 선택해주세요';


// ==========================================
// 4. 🌟 [업그레이드된] 타이머 및 배틀 진행 로직
// ==========================================
let endTime = 0; // 실제 시계 기준으로 종료 시간을 기록할 변수

startBtn.addEventListener('click', function() {
  if (startBtn.disabled) return; // 버튼이 잠겨있으면 클릭 무시!

  if (current !== null) {
    clearInterval(current);
    current = null;
    startBtn.innerText = '▶ 다시 시작';
  } 
  else {
    startBtn.innerText = '⏸ 일시정지';
    
    // 🌟 탭을 벗어나도 시간이 가도록 '현실 시간 기준 목표 종료 시간'을 기록합니다!
    endTime = Date.now() + (remained * 1000);
    
    current = setInterval(function() {
      // 🌟 현실 시간을 기준으로 남은 시간을 매초 다시 계산합니다 (다른 탭에 가도 작동!)
      remained = Math.round((endTime - Date.now()) / 1000); 
      if (remained < 0) remained = 0; // 0초 밑으로 내려가지 않게 방어

      // 진행 중인 할 일 버튼에 남은 시간 저장
      if (현재진행중인할일버튼 !== null) {
        현재진행중인할일버튼.setAttribute('data-time', remained);
      }

      // 화면 업데이트 1: 시간 글자
      let min = Math.floor(remained / 60);
      let sec = remained % 60;
      if (min < 10) min = '0' + min;
      if (sec < 10) sec = '0' + sec;
      timeText.innerText = min + ':' + sec;
      
      // 화면 업데이트 2: 파란색 시간 바
      let percent = (remained / total) * 100;
      timeBar.style.width = percent + '%'; 
      
      // 🌟 다른 탭에 오래 다녀와도 깎인 HP를 한 번에 정확히 계산합니다
      let 지난시간 = total - remained; 
      currentHP = maxHP - Math.floor(지난시간 / 60);
      if (currentHP < 0) currentHP = 0;

      if (현재진행중인할일버튼 !== null) {
        현재진행중인할일버튼.setAttribute('data-hp', currentHP);
      }

      wildHPText.innerText = currentHP + ' / ' + maxHP;
      let wildHpPercent = (currentHP / maxHP) * 100;
      wildHpFill.style.width = wildHpPercent + '%';
      
      // 타격 애니메이션 (매 분 정각마다 한 번씩만)
      if (remained > 0 && remained % 60 === 0) {
        const wildPokemon = document.getElementById('wildPokemon');
        wildPokemon.classList.add('hit-effect');
        setTimeout(() => wildPokemon.classList.remove('hit-effect'), 600);
      }
      
      // --- 종료 조건 (전투 승리!) ---
      if (remained <= 0) {
        clearInterval(current); 
        current = null;
        
        // 🌟 전투가 끝났으니 다른 타겟을 고를 때까지 다시 버튼 잠금!
        startBtn.disabled = true;
        startBtn.style.opacity = '0.5';
        startBtn.innerText = '타겟을 선택해주세요';
        
        const wildPokemon = document.getElementById('wildPokemon');
        wildPokemon.classList.add('faint-effect');

        let 퀘스트난이도 = 현재진행중인할일버튼 ? 현재진행중인할일버튼.getAttribute('data-diff') : 'easy';
        let 획득볼 = 1; 
        if (퀘스트난이도 === 'normal') 획득볼 = 2; 
        else if (퀘스트난이도 === 'hard') 획득볼 = 3; 

        setTimeout(function() {
          myMonsterballs = myMonsterballs + 획득볼; 
          
          const ballCountUI = document.getElementById('monsterballCount');
          ballCountUI.innerText = myMonsterballs;
          ballCountUI.classList.add('reward-bump');

          alert(`🎉 전투 승리! 집중을 완료하여 전리품으로 몬스터볼 ${획득볼}개를 획득했습니다!`);

          // 다음 전투를 위해 화면 리셋
          setTimeout(() => {
            wildPokemon.classList.remove('faint-effect');
            ballCountUI.classList.remove('reward-bump');
            document.getElementById('wildPokemonName').innerText = "타겟 탐색 대기 중...";
            document.getElementById('wildPokemon').src = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png";
            현재진행중인할일버튼 = null; // 완료된 퀘스트 지우기
          }, 1000);

        }, 1000); 
      }
    }, 1000); 
  }
});

// ==========================================
// 5. 난이도 Select 박스 변경 로직
// ==========================================
difficultySelect.addEventListener('change', function() {
  if (current !== null) {
    clearInterval(current);
    current = null;
    startBtn.innerText = '▶ 전투 시작';
  }

  const selectedValue = difficultySelect.value;

  if (selectedValue === 'easy') {
    total = 3600;  
    maxHP = 60;
  } else if (selectedValue === 'normal') {
    total = 7200;  
    maxHP = 120;
  } else if (selectedValue === 'hard') {
    total = 10800; 
    maxHP = 180;
  }

  remained = total;
  currentHP = maxHP;

  let min = Math.floor(remained / 60);
  let sec = remained % 60;
  if (min < 10) min = '0' + min;
  if (sec < 10) sec = '0' + sec;
  timeText.innerText = min + ':' + sec;
  
  timeBar.style.width = '100%';
  wildHpFill.style.width = '100%';
  wildHPText.innerText = currentHP + ' / ' + maxHP;

  console.log("난이도 변경 완료: " + selectedValue);
});

// ==========================================
// 6. 포켓몬 뽑기(상점) 기능
// ==========================================

// ==========================================
// 🌟 2. PokeAPI 서버에서 포켓몬 데려오기
// ==========================================
async function fetchRandomPokemon(isLegendary) {
  // 전설의 포켓몬 도감 번호 (프리져, 썬더, 파이어, 뮤츠, 뮤, 루기아, 칠색조 등)
  const legendaryIds = [
    144, 145, 146, 150, 151, // 1세대 (프리져, 썬더, 파이어, 뮤츠, 뮤)
    243, 244, 245, 249, 250, 251, // 2세대 (라이코, 앤테이, 스이쿤, 루기아, 칠색조, 세레비)
    377, 378, 379, 380, 381, 382, 383, 384, 385, 386, // 3세대 (레지시리즈, 라티남매, 가이오가, 그란돈, 레쿠쟈 등)
    483, 484, 487, 493 // 4세대 대표 (디아루가, 펄기아, 기라티나, 아르세우스)
  ];
  let pokemonId;

  if (isLegendary) {
    // 전설 뽑기: 정해진 전설 번호 중에서 랜덤
    const randomIndex = Math.floor(Math.random() * legendaryIds.length);
    pokemonId = legendaryIds[randomIndex];
  } else {
    // 일반 뽑기: 1번(이상해씨)부터 898번까지 무작위 랜덤!
    pokemonId = Math.floor(Math.random() * 898) + 1;
  }

  // 1. 포켓몬 기본 정보 (고화질 사진) 가져오기
  const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
  const data = await response.json();
  // 공식 고화질 일러스트가 있으면 쓰고, 없으면 기본 도트 이미지 사용
  const imgUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;

  // 2. 포켓몬 한국어 이름 가져오기 (한국어 데이터가 있는 species API 한 번 더 호출)
  const speciesResponse = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
  const speciesData = await speciesResponse.json();
  const koreanNameObj = speciesData.names.find(nameObj => nameObj.language.name === 'ko');
  const koreanName = koreanNameObj ? koreanNameObj.name : data.name; // 한국어 없으면 영어 이름

  return { id: pokemonId, name: koreanName, img: imgUrl };
}

// 1. 뽑기 버튼들 불러오기
const normalDrawBtn = document.getElementById('normalDraw');
const legendaryDrawBtn = document.getElementById('legendaryDraw');

// [팝업창 관련 요소 불러오기]
const gachaModal = document.getElementById('gachaModal');
const modalTitle = document.getElementById('modalTitle');
const modalImg = document.getElementById('modalImg');
const modalName = document.getElementById('modalName');
const modalCloseBtn = document.getElementById('modalCloseBtn');

// [팝업 닫기 버튼 설정]
modalCloseBtn.addEventListener('click', function() {
  gachaModal.classList.add('hidden'); // 다시 숨기기
});

// --- 일반 뽑기 버튼 ---
normalDrawBtn.addEventListener('click', async function() {
  if (myMonsterballs >= 1) {
    myMonsterballs = myMonsterballs - 1;
    document.getElementById('monsterballCount').innerText = myMonsterballs;
    saveData();

    // 로딩 중 표시 (통신에 0.5초 정도 걸릴 수 있으니까요!)
    modalTitle.innerText = "포켓몬을 부르는 중...";
    modalTitle.style.color = "#333";
    modalImg.src = "https://i.gifer.com/ZZ5H.gif"; // 빙글빙글 도는 몬스터볼 로딩 이미지
    modalName.innerText = "두구두구두구...";
    gachaModal.classList.remove('hidden');

    // 🌟 API에서 랜덤 일반 포켓몬 데려오기! (false = 일반)
    const drawnPokemon = await fetchRandomPokemon(false);

    // 데려온 포켓몬 정보로 모달창 업데이트!
    modalTitle.innerText = "일반 뽑기 성공!";
    modalImg.src = drawnPokemon.img;
    modalName.innerText = drawnPokemon.name;

    // 도감 기록
    let existingPokemon = myPokedex.find(p => p.name === drawnPokemon.name);
    if (existingPokemon) {
      existingPokemon.count = existingPokemon.count + 1;
    } else {
      myPokedex.push({ id: drawnPokemon.id, name: drawnPokemon.name, img: drawnPokemon.img, count: 1 });
    }
    updatePokedexUI();
    saveData();
    
  } else {
    alert('몬스터볼이 부족합니다!');
  }
});

// --- 전설 뽑기 버튼 ---
legendaryDrawBtn.addEventListener('click', async function() {
  if (myMonsterballs >= 10) {
    myMonsterballs = myMonsterballs - 10;
    document.getElementById('monsterballCount').innerText = myMonsterballs;
    saveData();

    modalTitle.innerText = "전설의 기운이 느껴진다...";
    modalTitle.style.color = "#333";
    modalImg.src = "https://i.gifer.com/ZZ5H.gif"; 
    modalName.innerText = "두구두구두구...";
    gachaModal.classList.remove('hidden');

    // 🌟 API에서 전설의 포켓몬 데려오기! (true = 전설)
    const drawnPokemon = await fetchRandomPokemon(true);

    modalTitle.innerText = "전설의 포켓몬 등장!";
    modalImg.src = drawnPokemon.img;
    modalName.innerText = drawnPokemon.name;

    // 도감 기록
    let existingPokemon = myPokedex.find(p => p.name === drawnPokemon.name);
    if (existingPokemon) {
      existingPokemon.count = existingPokemon.count + 1;
    } else {
      myPokedex.push({ id: drawnPokemon.id, name: drawnPokemon.name, img: drawnPokemon.img, count: 1 });
    }
    updatePokedexUI();
    saveData();
    
  } else {
    alert('전설 뽑기를 하기엔 몬스터볼이 부족합니다! (10개 필요)');
  }
});


// ==========================================
// 7. 나의 도감 기능
// ==========================================

// (도감 상세 팝업창 닫기 버튼 이벤트 먼저 등록)
// 주의: index.html에 dexModal, dexCloseBtn 뼈대가 있어야 작동합니다!
const dexCloseBtn = document.getElementById('dexCloseBtn');
if (dexCloseBtn) {
  dexCloseBtn.addEventListener('click', () => {
    document.getElementById('dexModal').classList.add('hidden');
  });
}

const setPartnerBtn = document.getElementById('setPartnerBtn');
if (setPartnerBtn) {
  setPartnerBtn.addEventListener('click', () => {
    // 1. 현재 모달창에 떠 있는 포켓몬의 이름과 사진을 가져옵니다.
    const currentDexName = document.getElementById('dexName').innerText;
    const currentDexImg = document.getElementById('dexImg').src;

    // 2. 내 파트너 변수에 덮어씌웁니다.
    myPartner = { name: currentDexName, img: currentDexImg };
    saveData(); // 즉시 저장!

    // 3. 메인 화면(전투 필드)의 내 포켓몬 사진을 바로 바꿔줍니다.
    const myPokemonImg = document.querySelector('.my-pokemon-area img');
    if (myPokemonImg) {
      myPokemonImg.src = myPartner.img;
    }

    // 4. 모달창을 닫고 성공 알림을 띄웁니다.
    document.getElementById('dexModal').classList.add('hidden');
    alert(`🎉 ${myPartner.name}이(가) 메인 파트너로 설정되었습니다!`);
  });
}

function updatePokedexUI() {
  const pokedexGrid = document.getElementById('pokedexGrid');
  pokedexGrid.innerHTML = ''; 

  if (myPokedex.length === 0) {
    pokedexGrid.innerHTML = '<p style="text-align:center; width:100%; color:#999; font-size:18px;">아직 획득한 포켓몬이 없습니다. 가챠를 돌려보세요!</p>';
    return;
  }

  // 🌟 forEach에 index를 추가하여 몇 번째 포켓몬인지 기억하게 합니다.
  myPokedex.forEach(function(pokemon, index) {
    const card = document.createElement('div');
    card.className = 'pokedex-card';
    card.style.cursor = 'pointer'; 
    
    // 🌟 카드 안에 휴지통 버튼(delete-btn)을 추가했습니다.
    card.innerHTML = `
      <button class="delete-btn" style="position: absolute; top: 5px; left: 5px; background: none; border: none; font-size: 16px; cursor: pointer; z-index: 10;">🗑️</button>
      <span class="count">x${pokemon.count}</span>
      <img src="${pokemon.img}" alt="${pokemon.name}">
      <h4>${pokemon.name}</h4>
    `;
    
// [기능 1] 휴지통 버튼을 눌렀을 때 (수정된 삭제 기능)
    const deleteBtn = card.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function(e) {
      e.stopPropagation(); // 🌟 핵심! 모달창이 뜨는 것을 막아줍니다.
      
      let 진짜삭제 = confirm(`정말로 ${pokemon.name} 1마리를 박사에게 보내시겠습니까?`);
      if (진짜삭제) {
        // 🌟 2마리 이상일 때는 숫자만 1개 줄이고, 1마리일 때만 아예 삭제합니다!
        if (pokemon.count > 1) {
          pokemon.count = pokemon.count - 1; 
        } else {
          myPokedex.splice(index, 1); 
        }
        
        saveData(); // 변경된 도감을 브라우저에 저장!
        updatePokedexUI(); // 도감 화면 새로고침!
      }
    });

    // [기능 2] 카드 빈 곳을 눌렀을 때 (기존 상세 정보 모달창 띄우기)
    card.addEventListener('click', async function() {
      const dexModal = document.getElementById('dexModal');
      document.getElementById('dexName').innerText = pokemon.name;
      document.getElementById('dexImg').src = pokemon.img;
      document.getElementById('dexDesc').innerText = "포켓몬의 생태를 조사하는 중입니다...";
      dexModal.classList.remove('hidden');

      if(pokemon.id) {
        try {
          const res = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemon.id}`);
          const data = await res.json();
          const koFlavor = data.flavor_text_entries.find(f => f.language.name === 'ko');
          document.getElementById('dexDesc').innerText = koFlavor ? koFlavor.flavor_text : "이 지역의 도감에는 아직 설명이 등록되지 않았습니다.";
        } catch(e) {
          document.getElementById('dexDesc').innerText = "통신 오류로 데이터를 불러오지 못했습니다.";
        }
      } else {
        document.getElementById('dexDesc').innerText = "과거에 획득한 포켓몬이라 상세 데이터가 없습니다. 새로 뽑아주세요!";
      }
    });

    pokedexGrid.appendChild(card);
  });
}
updatePokedexUI();

  // ==========================================
// 🌟 8. 할 일 수정 모달창 기능
// ==========================================
const editModal = document.getElementById('editModal');
const editCancelBtn = document.getElementById('editCancelBtn');
const editSaveBtn = document.getElementById('editSaveBtn');

// [취소 버튼] 누르면 창 닫기
if (editCancelBtn) {
  editCancelBtn.addEventListener('click', () => {
    editModal.classList.add('hidden');
  });
}

// [저장 버튼] 누르면 변경된 내용 적용하기!
if (editSaveBtn) {
  editSaveBtn.addEventListener('click', () => {
    // 1. 버튼에 아까 몰래 적어둔 ID와, 유저가 새로 입력한 값들 가져오기
    const targetId = Number(editSaveBtn.getAttribute('data-id'));
    const newText = document.getElementById('editTodoInput').value;
    const newDiff = document.getElementById('editDifficultySelect').value;

    if (newText.trim() === '') {
      alert('할 일을 입력해 주세요!');
      return;
    }

    // 2. 내 일기장(myTodos 배열)에서 해당 할 일 찾기
    const targetTodo = myTodos.find(t => t.id === targetId);
    if (targetTodo) {
      // 3. 데이터 덮어씌우기
      targetTodo.text = newText;
      targetTodo.difficulty = newDiff;
      
      // 🌟 난이도가 바뀌었으니 보여지는 글자, 몬스터 체력, 시간도 다시 계산해 줍니다!
      if (newDiff === 'easy') { targetTodo.diffText = '하'; targetTodo.time = 3600; targetTodo.hp = 60; }
      else if (newDiff === 'normal') { targetTodo.diffText = '중'; targetTodo.time = 7200; targetTodo.hp = 120; }
      else if (newDiff === 'hard') { targetTodo.diffText = '상'; targetTodo.time = 10800; targetTodo.hp = 180; }

      // 4. 저장하고 화면 새로고침 후 모달창 닫기
      saveData();      
      renderTodos();   
      editModal.classList.add('hidden'); 
    }
  });
}
