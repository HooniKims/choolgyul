document.addEventListener('DOMContentLoaded', function() {
    function justifyText(element) {
        const originalHtml = element.innerHTML;
        element.innerHTML = '';

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalHtml;
        const text = tempDiv.textContent || tempDiv.innerText || "";

        for (let char of text) {
            const span = document.createElement('span');
            if (char === ' ') {
                span.innerHTML = '&nbsp;';
            } else {
                span.textContent = char;
            }
            element.appendChild(span);
        }
    }

    // 모든 지정 라인(첫 문장, 기간 줄) 폭을 그대로 두고 글자 단위로만 분배
    document.querySelectorAll('.text-justify-container').forEach(el => justifyText(el));

    // Control panel logic - 패널 기본 표시
    const toggle = document.getElementById('controlToggle');
    const panel = document.getElementById('controlPanel');
    if(panel) panel.style.display = 'block';
    if(toggle) toggle.style.display = 'none';
    
    if(toggle) {
        toggle.addEventListener('click', () => {
            panel.style.display = 'block';
            toggle.style.display = 'none';
        });
    }
    
    const closeBtn = document.getElementById('btnClosePanel');
    if(closeBtn) {
        closeBtn.addEventListener('click', () => {
            panel.style.display = 'none';
            toggle.style.display = 'block';
        });
    }

    // 날짜 초기화
    const today = new Date();
    const toInput = d => d.toISOString().slice(0,10);
    
    // 한국 고정 공휴일 계산 함수
    function getKoreanHolidays(year) {
        const holidays = [];
        
        // 고정 공휴일들
        holidays.push(`${year}-01-01`); // 신정
        holidays.push(`${year}-03-01`); // 삼일절
        holidays.push(`${year}-05-05`); // 어린이날
        holidays.push(`${year}-06-06`); // 현충일
        holidays.push(`${year}-08-15`); // 광복절
        holidays.push(`${year}-10-03`); // 개천절
        holidays.push(`${year}-10-09`); // 한글날
        holidays.push(`${year}-12-25`); // 크리스마스
        
        // 부처님오신날 (음력 4월 8일) - 근사치 계산
        const buddhasBirthday = getBuddhasBirthday(year);
        if (buddhasBirthday) holidays.push(buddhasBirthday);
        
        // 음력 설날, 추석 계산 (간단한 근사치)
        const lunarNewYear = getLunarNewYear(year);
        const chuseok = getChuseok(year);
        
        if (lunarNewYear) {
            // 설날 연휴 (설날 전날, 설날, 설날 다음날)
            const nyDate = new Date(lunarNewYear);
            holidays.push(toDateString(new Date(nyDate.getTime() - 86400000))); // 전날
            holidays.push(lunarNewYear); // 설날
            holidays.push(toDateString(new Date(nyDate.getTime() + 86400000))); // 다음날
        }
        
        if (chuseok) {
            // 추석 연휴 (추석 전날, 추석, 추석 다음날)
            const csDate = new Date(chuseok);
            holidays.push(toDateString(new Date(csDate.getTime() - 86400000))); // 전날
            holidays.push(chuseok); // 추석
            holidays.push(toDateString(new Date(csDate.getTime() + 86400000))); // 다음날
        }
        
        // 어린이날이 주말인 경우 대체휴일
        const childrensDay = new Date(`${year}-05-05`);
        if (childrensDay.getDay() === 0 || childrensDay.getDay() === 6) {
            const nextMonday = new Date(childrensDay);
            nextMonday.setDate(nextMonday.getDate() + (8 - childrensDay.getDay()) % 7);
            holidays.push(toDateString(nextMonday));
        }
        
        return holidays;
    }
    
    function toDateString(date) {
        return date.toISOString().slice(0, 10);
    }
    
    // 음력 설날 근사 계산 (실제로는 더 복잡하지만 교육용으로 간소화)
    function getLunarNewYear(year) {
        const lunarNewYears = {
            2023: '2023-01-22',
            2024: '2024-02-10',
            2025: '2025-01-29',
            2026: '2026-02-17',
            2027: '2027-02-06',
            2028: '2028-01-26',
            2029: '2029-02-13',
            2030: '2030-02-03'
        };
        return lunarNewYears[year];
    }
    
    // 음력 추석 근사 계산
    function getChuseok(year) {
        const chuseoks = {
            2023: '2023-09-29',
            2024: '2024-09-17',
            2025: '2025-10-06',
            2026: '2026-09-25',
            2027: '2027-09-15',
            2028: '2028-10-03',
            2029: '2029-09-22',
            2030: '2030-09-12'
        };
        return chuseoks[year];
    }
    
    // 부처님오신날 근사 계산
    function getBuddhasBirthday(year) {
        const buddhasBirthdays = {
            2023: '2023-05-27',
            2024: '2024-05-15',
            2025: '2025-05-31',
            2026: '2026-05-24',
            2027: '2027-05-13',
            2028: '2028-05-02',
            2029: '2029-05-20',
            2030: '2030-05-09'
        };
        return buddhasBirthdays[year];
    }
    
    function isWeekend(date) {
        const day = date.getDay();
        return day === 0 || day === 6; // 일요일(0) 또는 토요일(6)
    }
    
    function isHoliday(date) {
        const year = date.getFullYear();
        const dateStr = date.toISOString().slice(0, 10);
        const yearHolidays = getKoreanHolidays(year);
        return yearHolidays.includes(dateStr);
    }
    
    function isWorkday(date) {
        return !isWeekend(date) && !isHoliday(date);
    }
    
    function calculateWorkdays(startDate, endDate) {
        let count = 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            if (isWorkday(d)) {
                count++;
            }
        }
        
        return count;
    }
    
    function getNextWorkday(date) {
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        while (!isWorkday(nextDay)) {
            nextDay.setDate(nextDay.getDate() + 1);
        }
        
        return nextDay;
    }
    
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const submitDate = document.getElementById('submitDate');
    if(startDate) startDate.value = toInput(today);
    if(endDate) endDate.value = toInput(today);
    // 제출일은 나중에 설정 (함수 정의 후)

    function pad2(n) {
        return (''+n).padStart(2,'0');
    }
    
    function noZeroPad(n) {
        return ''+n;
    }
    
    function diffDays(a, b) {
        return Math.round((b-a)/86400000)+1;
    }

    function apply() {
        const g = id => document.getElementById(id);
        const studentId = g('inpStudentId').value.trim();
        const studentName = g('inpStudentName').value.trim();
        const guardian = g('inpGuardianName').value.trim();
        const teacher = g('inpTeacherName').value.trim();
        const type = g('selType').value;
        const reason = g('selReason').value;
        const sDate = g('startDate').value; 
        const eDate = g('endDate').value; 
        const subDate = g('submitDate').value;
        const sPeriod = g('startPeriod').value === '조회' ? '조회' : (parseInt(g('startPeriod').value, 10) || 1); 
        const ePeriod = g('endPeriod').value === '조회' ? '조회' : (parseInt(g('endPeriod').value, 10) || sPeriod);
        const dayCount = parseInt(g('dayCount').value, 10) || 1; // 사용자가 입력한 날짜수 사용
        
        // 기간 적용 (간격 넓게)
        const period = document.getElementById('periodLine');
        if(period) {
            const sd = new Date(sDate); 
            const ed = new Date(eDate); 
            // 교시 표시 처리
            const sPeriodText = sPeriod === '조회' ? '조회' : `${sPeriod}교시`;
            const ePeriodText = ePeriod === '조회' ? '조회' : `${ePeriod}교시`;
            // 간격을 더 넓게 조정 (사용자가 입력한 날짜수 사용)
            const str = `20${pad2(sd.getFullYear()%100)}년&nbsp;&nbsp;${noZeroPad(sd.getMonth()+1)}월&nbsp;&nbsp;${noZeroPad(sd.getDate())}일&nbsp;&nbsp;${sPeriodText} ~ 20${pad2(ed.getFullYear()%100)}년&nbsp;&nbsp;${noZeroPad(ed.getMonth()+1)}월&nbsp;&nbsp;${noZeroPad(ed.getDate())}일&nbsp;&nbsp;${ePeriodText}(${dayCount}일간)`;
            period.classList.remove('text-justify-container');
            period.innerHTML = `<span class="hrt cs10">${str}</span>`;
        }
        
        // 사유 적용 (중앙정렬)
        const reasonCell = document.getElementById('reasonCell');
        if(reasonCell) {
            const map = {병원진료:'병원 진료', 미인정:'미인정', 기타:'기타'};
            let displayReason = '';
            
            if(reason === '기타') {
                const otherText = g('reasonOtherText').value;
                displayReason = otherText ? `기타(${otherText})` : '기타';
            } else {
                displayReason = map[reason] || reason;
            }
            
            reasonCell.innerHTML = reason ? `<span class='hrt cs10' style="display:block;text-align:center;">${displayReason}</span>` : '';
        }
        
        // 제출일 적용 (간격 넓게)
        const subLine = document.getElementById('submissionDateLine');
        if(subLine && subDate) {
            const d = new Date(subDate); 
            // 제출일의 간격 넓히기
            subLine.innerHTML = `&nbsp;&nbsp;20${pad2(d.getFullYear()%100)}년&nbsp;&nbsp;&nbsp;&nbsp;${noZeroPad(d.getMonth()+1)}월&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${noZeroPad(d.getDate())}일`;
        }
        
        // 담임 확인 방법 기타 내용 적용
        const confirmMethod = g('confirmMethod').value;
        const confirmMethodParens = document.getElementById('confirmMethodParens');
        if(confirmMethodParens) {
            if(confirmMethod === '기타') {
                const otherText = g('confirmMethodOtherText').value;
                if(otherText) {
                    confirmMethodParens.innerHTML = `<span class="hrt cs16">(</span><span class="hrt cs16" style="flex:1;text-align:center;">${otherText}</span><span class="hrt cs16">)</span>`;
                } else {
                    confirmMethodParens.innerHTML = '<span class="hrt cs16">(</span><span class="hrt cs16">)</span>';
                }
            } else {
                confirmMethodParens.innerHTML = '<span class="hrt cs16">(</span><span class="hrt cs16">)</span>';
            }
            confirmMethodParens.style.justifyContent = 'space-between';
        }
        
        // 첨부 서류 기타 내용 적용
        const attachmentType = g('attachmentType').value;
        const attachmentParens = document.getElementById('attachmentParens');
        if(attachmentParens) {
            if(attachmentType === '기타') {
                const otherText = g('attachmentOtherText').value;
                if(otherText) {
                    attachmentParens.innerHTML = `<span class="hrt cs16">(</span><span class="hrt cs16" style="flex:1;text-align:center;">${otherText}</span><span class="hrt cs16">)</span>`;
                } else {
                    attachmentParens.innerHTML = '<span class="hrt cs16">(</span><span class="hrt cs16">)</span>';
                }
            } else {
                attachmentParens.innerHTML = '<span class="hrt cs16">(</span><span class="hrt cs16">)</span>';
            }
            attachmentParens.style.justifyContent = 'space-between';
        }
        
        // 추가사항 적용 (중앙정렬)
        const notes = document.getElementById('txtNotes').value.trim();
        const add = document.getElementById('additionalNotes'); 
        if(add) {
            add.innerHTML = notes ? `<span class='hrt cs10' style="display:block;text-align:center;">${notes.replace(/\n/g,'<br>')}</span>` : '';
        }
        
        // 본인과 보호자, 담임 이름과 (인) 사이 간격 넓히기
        applyNameSpacing('studentNamePrint', studentName);
        applyNameSpacing('guardianNamePrint', guardian);
        // 담임은 teacherNamePrint 비워두고 teacherNameArea에만 설정
        
        // 이름 영역에만 이름 설정
        setNameInArea('studentNameArea', studentName);
        setNameInArea('guardianNameArea', guardian);
        setNameInArea('teacherNameArea', teacher);
        
        // 상단 성명 부분에도 학생 이름 설정
        setNameInArea('topStudentName', studentName);
        
        // 상단 학번 부분에 학번 설정
        setNameInArea('topStudentId', studentId);
        
        // 종류에 따른 박스 표시
        updateTypeBoxes(type);
    }
    
    // 이름 적용 유틸리티 함수 - 이름 뒤에 (인)이 바로 붙도록 수정
    function applyNameSpacing(elementId, name) {
        const elements = document.querySelectorAll('#' + elementId);
        elements.forEach(element => {
            if(element) {
                element.textContent = name;
            }
        });
    }
    
    // 이름 영역에 이름 설정하는 함수
    function setNameInArea(elementId, name) {
        const element = document.getElementById(elementId);
        if(element && name) {
            // 한 글자마다 공백 추가
            const spacedName = name.split('').join(' ');
            element.innerHTML = `<span class="hrt cs10">${spacedName}</span>`;
        } else if(element) {
            element.innerHTML = '';
        }
    }
    
    // 종류에 따른 박스 표시 함수
    function updateTypeBoxes(type) {
        // 모든 박스 초기화 (모든 클래스 제거)
        const boxes = ['diseaseBox', 'etcBox', 'absentBox', 'lateBox', 'earlyBox', 'resultBox', 'resultBox2'];
        boxes.forEach(boxId => {
            const element = document.getElementById(boxId);
            if(element) {
                element.classList.remove('type-selected', 'type-selected-left', 'type-selected-right');
            }
        });
        
        // 선택된 종류에 따라 박스 표시
        switch(type) {
            case '질병결석':
                document.getElementById('diseaseBox')?.classList.add('type-selected');
                break;
            case '기타결석':
                document.getElementById('etcBox')?.classList.add('type-selected');
                break;
            case '인정결석':
                document.getElementById('absentBox')?.classList.add('type-selected');
                break;
            case '인정지각':
                document.getElementById('lateBox')?.classList.add('type-selected');
                break;
            case '인정조퇴':
                document.getElementById('earlyBox')?.classList.add('type-selected');
                break;
            case '인정결과':
                // "결"에는 오른쪽 테두리 제거, "과"에는 왼쪽 테두리 제거
                document.getElementById('resultBox')?.classList.add('type-selected-left');
                document.getElementById('resultBox2')?.classList.add('type-selected-right');
                break;
        }
    }
    
    function reset() {
        ['inpStudentId','inpStudentName','inpGuardianName','inpTeacherName','txtNotes'].forEach(id => {
            const el = document.getElementById(id); 
            if(el) el.value = '';
        });
        
        ['selType','selReason'].forEach(id => {
            const el = document.getElementById(id); 
            if(el) el.value = '';
        });
        
        // 교시 선택 초기화 및 '교시' 텍스트 복원
        ['startPeriod','endPeriod'].forEach(id => {
            const el = document.getElementById(id); 
            if(el) el.value = '조회';
        });
        
        // 날짜수 초기화
        const dayCountEl = document.getElementById('dayCount');
        if(dayCountEl) dayCountEl.value = '';
        
        const startSuffix = document.getElementById('startPeriodSuffix');
        const endSuffix = document.getElementById('endPeriodSuffix');
        if(startSuffix) startSuffix.style.display = 'none';
        if(endSuffix) endSuffix.style.display = 'none';
        
        // 담임 확인 방법과 첨부 서류 초기화
        ['confirmMethod','attachmentType'].forEach(id => {
            const el = document.getElementById(id); 
            if(el) el.value = '';
        });
        
        // 기타 사유 입력 칸 숨기기 및 초기화
        const reasonOtherContainer = document.getElementById('reasonOtherContainer');
        const reasonOtherText = document.getElementById('reasonOtherText');
        if(reasonOtherContainer) reasonOtherContainer.style.display = 'none';
        if(reasonOtherText) reasonOtherText.value = '';
        
        // 담임 확인 방법 기타 입력 칸 숨기기 및 초기화
        const confirmMethodOtherContainer = document.getElementById('confirmMethodOtherContainer');
        const confirmMethodOtherText = document.getElementById('confirmMethodOtherText');
        if(confirmMethodOtherContainer) confirmMethodOtherContainer.style.display = 'none';
        if(confirmMethodOtherText) confirmMethodOtherText.value = '';
        
        // 첨부 서류 기타 입력 칸 숨기기 및 초기화
        const attachmentOtherContainer = document.getElementById('attachmentOtherContainer');
        const attachmentOtherText = document.getElementById('attachmentOtherText');
        if(attachmentOtherContainer) attachmentOtherContainer.style.display = 'none';
        if(attachmentOtherText) attachmentOtherText.value = '';
        
        const period = document.getElementById('periodLine'); 
        if(period) {
            period.innerHTML = '<span class="hrt cs10">20&nbsp;&nbsp;&nbsp;년 &nbsp;&nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;일 &nbsp;&nbsp;&nbsp;교시 ~ 20&nbsp;&nbsp;&nbsp;년 &nbsp;&nbsp;&nbsp;월 &nbsp;&nbsp;&nbsp;일 &nbsp;&nbsp;&nbsp;교시( &nbsp;&nbsp;&nbsp;일간)</span>';
            period.classList.add('text-justify-container');
        }
        
        document.getElementById('reasonCell').innerHTML = '';
        document.getElementById('additionalNotes').innerHTML = '';
        
        // 모든 네모 박스 제거
        document.querySelectorAll('.type-selected, .type-selected-left, .type-selected-right').forEach(el => {
            el.classList.remove('type-selected', 'type-selected-left', 'type-selected-right');
        });
        
        // 종류 선택 박스들 명시적으로 제거
        const typeBoxes = ['diseaseBox', 'otherBox', 'absentBox', 'lateBox', 'earlyBox', 'resultBox', 'resultBox2'];
        typeBoxes.forEach(id => {
            const el = document.getElementById(id);
            if(el) {
                el.classList.remove('type-selected', 'type-selected-left', 'type-selected-right');
                el.style.border = 'none';
                el.style.padding = '';
            }
        });
        
        // 담임 확인 방법 네모 박스 제거
        document.querySelectorAll('#confirmMethod1, #confirmMethod2, #confirmMethod3, #confirmMethod4').forEach(el => {
            el.style.border = 'none';
        });
        
        // 첨부 서류 네모 박스 제거
        document.querySelectorAll('#attachment1, #attachment2, #attachment3, #attachment4').forEach(el => {
            el.style.border = 'none';
            el.style.padding = '';
        });
        
        // 괄호 내용 초기화
        const confirmMethodParens = document.getElementById('confirmMethodParens');
        const attachmentParens = document.getElementById('attachmentParens');
        if(confirmMethodParens) {
            confirmMethodParens.innerHTML = '<span class="hrt cs16">(</span><span class="hrt cs16">)</span>';
            confirmMethodParens.style.justifyContent = 'space-between';
        }
        if(attachmentParens) {
            attachmentParens.innerHTML = '<span class="hrt cs16">(</span><span class="hrt cs16">)</span>';
            attachmentParens.style.justifyContent = 'space-between';
        }
        
        // 이름 필드들 리셋
        resetNameField('studentNamePrint');
        resetNameField('guardianNamePrint');
        // teacherNamePrint는 리셋하지 않음 (사용하지 않음)
        resetNameField('studentNameArea');
        resetNameField('guardianNameArea');
        resetNameField('teacherNameArea');
        resetNameField('topStudentName');
        resetNameField('topStudentId');
    }
    
    function resetNameField(elementId) {
        const element = document.getElementById(elementId);
        if(element) {
            element.innerHTML = '';
        }
    }
    
    // 출력하기 버튼 기능
    const printBtn = document.getElementById('btnPrint'); 
    if(printBtn) {
        printBtn.addEventListener('click', function() {
            window.print();
        });
        
        // 초기 로드 시 기본값으로 바로 적용
        if(document.getElementById('inpStudentId')) {
            document.getElementById('inpStudentId').value = '';
            document.getElementById('inpStudentName').value = '';
            document.getElementById('inpGuardianName').value = '';
            document.getElementById('inpTeacherName').value = '';
            document.getElementById('selType').value = '';
            document.getElementById('selReason').value = '';
            document.getElementById('startPeriod').value = '1';
            document.getElementById('endPeriod').value = '6';
            document.getElementById('confirmMethod').value = '';
            document.getElementById('attachmentType').value = '';
        }
    }
    
    const resetBtn = document.getElementById('btnReset'); 
    if(resetBtn) resetBtn.addEventListener('click', reset);

    // 종류 선택 이벤트 처리
    const typeSelect = document.getElementById('selType');
    if(typeSelect) {
        typeSelect.addEventListener('change', function() {
            updateTypeBoxes(this.value);
            apply(); // 선택 변경 시 즉시 적용
        });
    }

    // 사유 선택 이벤트 처리
    const reasonSelect = document.getElementById('selReason');
    const reasonOtherContainer = document.getElementById('reasonOtherContainer');
    const reasonOtherText = document.getElementById('reasonOtherText');
    
    if(reasonSelect && reasonOtherContainer) {
        reasonSelect.addEventListener('change', function() {
            if(this.value === '기타') {
                reasonOtherContainer.style.display = 'block';
                // 기타 입력 필드에 실시간 이벤트 리스너 추가
                if(reasonOtherText) {
                    reasonOtherText.addEventListener('input', apply);
                    reasonOtherText.addEventListener('change', apply);
                }
            } else {
                reasonOtherContainer.style.display = 'none';
                if(reasonOtherText) reasonOtherText.value = '';
            }
            apply(); // 선택 변경 시 즉시 적용
        });
    }

    // 담임 확인 방법 드롭다운 기능
    const confirmMethodSelect = document.getElementById('confirmMethod');
    const confirmMethodOtherContainer = document.getElementById('confirmMethodOtherContainer');
    const confirmMethodOtherText = document.getElementById('confirmMethodOtherText');
    
    if(confirmMethodSelect && confirmMethodOtherContainer) {
        // select 변경 이벤트 처리
        confirmMethodSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            
            if(selectedValue === '기타') {
                confirmMethodOtherContainer.style.display = 'block';
                // 기타 입력 필드에 실시간 이벤트 리스너 추가
                if(confirmMethodOtherText) {
                    confirmMethodOtherText.addEventListener('input', apply);
                    confirmMethodOtherText.addEventListener('change', apply);
                }
            } else {
                confirmMethodOtherContainer.style.display = 'none';
                if(confirmMethodOtherText) confirmMethodOtherText.value = '';
            }
            
            // 네모 박스 그리기 (기타는 제외)
            updateConfirmMethodBoxes(selectedValue);
            apply(); // 선택 변경 시 즉시 적용
        });
    }

    // 첨부 서류 선택 기능
    const attachmentSelect = document.getElementById('attachmentType');
    const attachmentOtherContainer = document.getElementById('attachmentOtherContainer');
    const attachmentOtherText = document.getElementById('attachmentOtherText');
    
    if(attachmentSelect && attachmentOtherContainer) {
        // select 변경 이벤트 처리
        attachmentSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            
            if(selectedValue === '기타') {
                attachmentOtherContainer.style.display = 'block';
                // 기타 입력 필드에 실시간 이벤트 리스너 추가
                if(attachmentOtherText) {
                    attachmentOtherText.addEventListener('input', apply);
                    attachmentOtherText.addEventListener('change', apply);
                }
            } else {
                attachmentOtherContainer.style.display = 'none';
                if(attachmentOtherText) attachmentOtherText.value = '';
            }
            
            // 네모 박스 그리기 (기타는 제외)
            updateAttachmentBoxes(selectedValue);
            apply(); // 선택 변경 시 즉시 적용
        });
    }

    // 담임 확인 방법에 네모 박스 그리기 함수
    function updateConfirmMethodBoxes(selectedMethod) {
        // 기존 박스 제거
        document.querySelectorAll('#confirmMethod1, #confirmMethod2, #confirmMethod3, #confirmMethod4').forEach(el => {
            el.style.border = 'none';
        });
        
        if (selectedMethod && selectedMethod !== '기타') {
            // 선택된 방법에 네모 박스 그리기
            let targetId = '';
            switch(selectedMethod) {
                case '보호자 대면':
                    targetId = 'confirmMethod1';
                    break;
                case '보호자 통화':
                    targetId = 'confirmMethod2';
                    break;
                case '문자 및 SNS':
                    targetId = 'confirmMethod3';
                    break;
            }
            
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.style.border = '2px solid #000';
                    targetElement.style.padding = '1px 2px';
                }
            }
        }
    }

    // 첨부 서류에 네모 박스 그리기 함수
    function updateAttachmentBoxes(selectedAttachment) {
        // 기존 박스 제거
        document.querySelectorAll('#attachment1, #attachment2, #attachment3, #attachment4').forEach(el => {
            el.style.border = 'none';
            el.style.padding = '';
        });
        
        if (selectedAttachment && selectedAttachment !== '기타') {
            // 선택된 첨부 서류에 네모 박스 그리기
            let targetId = '';
            switch(selectedAttachment) {
                case '진단서':
                    targetId = 'attachment1';
                    break;
                case '의사소견서':
                    targetId = 'attachment2';
                    break;
                case '진료확인서 및 처방전':
                    targetId = 'attachment3';
                    break;
            }
            
            if (targetId) {
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.style.border = '2px solid #000';
                    targetElement.style.padding = '1px 2px';
                }
            }
        }
    }
    
    // 교시 선택에 따른 '교시' 텍스트 표시/숨김
    function updatePeriodSuffix(selectId, suffixId) {
        const select = document.getElementById(selectId);
        const suffix = document.getElementById(suffixId);
        
        if (select && suffix) {
            select.addEventListener('change', function() {
                if (this.value === '조회') {
                    suffix.style.display = 'none';
                } else {
                    suffix.style.display = 'inline';
                }
            });
        }
    }
    
    // 시작교시와 종료교시에 이벤트 리스너 추가
    updatePeriodSuffix('startPeriod', 'startPeriodSuffix');
    updatePeriodSuffix('endPeriod', 'endPeriodSuffix');
    
    // 날짜 변경 시 영업일 자동 계산
    function updateWorkdayCount() {
        const startDateInput = document.getElementById('startDate');
        const endDateInput = document.getElementById('endDate');
        const dayCountInput = document.getElementById('dayCount');
        
        if (startDateInput && endDateInput && dayCountInput) {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            
            if (startDate && endDate) {
                const workdays = calculateWorkdays(new Date(startDate), new Date(endDate));
                dayCountInput.value = workdays;
            }
        }
    }
    
    // 시작일과 종료일 변경 이벤트 리스너 추가
    const startDateEl = document.getElementById('startDate');
    const endDateEl = document.getElementById('endDate');
    
    if (startDateEl) {
        startDateEl.addEventListener('change', function() {
            console.log('Start date changed:', this.value);
            updateWorkdayCount();
        });
    }
    if (endDateEl) {
        endDateEl.addEventListener('change', function() {
            console.log('End date changed:', this.value);
            updateWorkdayCount();
            
            // 제출일 직접 업데이트
            const submitDateInput = document.getElementById('submitDate');
            if (this.value && submitDateInput) {
                const endDate = new Date(this.value);
                let nextDay = new Date(endDate);
                nextDay.setDate(nextDay.getDate() + 1);
                
                // 다음 영업일 찾기
                while (isWeekend(nextDay) || isHoliday(nextDay)) {
                    nextDay.setDate(nextDay.getDate() + 1);
                }
                
                const newSubmitDate = nextDay.toISOString().slice(0, 10);
                console.log('Setting new submit date:', newSubmitDate);
                submitDateInput.value = newSubmitDate;
            }
        });
    }
    
    // 초기 로드 시 영업일 계산
    updateWorkdayCount();
    
    // 초기 제출일 설정 (모든 함수 정의 후)
    const submitDateEl = document.getElementById('submitDate');
    if(submitDateEl) {
        const nextWorkday = getNextWorkday(today);
        submitDateEl.value = toInput(nextWorkday);
    }
    
    // 실시간 업데이트를 위한 이벤트 리스너들
    function setupRealTimeUpdate() {
        // 텍스트 입력 필드들
        const textInputs = ['inpStudentId', 'inpStudentName', 'inpGuardianName', 'inpTeacherName', 'txtNotes'];
        textInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', apply);
                element.addEventListener('change', apply);
            }
        });
        
        // 드롭다운 선택 필드들
        const selectInputs = ['selType', 'selReason', 'confirmMethod', 'attachmentType', 'startPeriod', 'endPeriod'];
        selectInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', apply);
            }
        });
        
        // 날짜 입력 필드들
        const dateInputs = ['startDate', 'endDate', 'submitDate'];
        dateInputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', apply);
            }
        });
        
        // 날짜수 입력 필드
        const dayCountEl = document.getElementById('dayCount');
        if (dayCountEl) {
            dayCountEl.addEventListener('input', apply);
            dayCountEl.addEventListener('change', apply);
        }
        
        // 기타 사유 입력 필드
        const reasonOtherTextEl = document.getElementById('reasonOtherText');
        if (reasonOtherTextEl) {
            reasonOtherTextEl.addEventListener('input', apply);
            reasonOtherTextEl.addEventListener('change', apply);
        }
        
        // 담임 확인 방법 기타 입력 필드
        const confirmMethodOtherTextEl = document.getElementById('confirmMethodOtherText');
        if (confirmMethodOtherTextEl) {
            confirmMethodOtherTextEl.addEventListener('input', apply);
            confirmMethodOtherTextEl.addEventListener('change', apply);
        }
        
        // 첨부 서류 기타 입력 필드
        const attachmentOtherTextEl = document.getElementById('attachmentOtherText');
        if (attachmentOtherTextEl) {
            attachmentOtherTextEl.addEventListener('input', apply);
            attachmentOtherTextEl.addEventListener('change', apply);
        }
    }
    
    // 실시간 업데이트 설정
    setupRealTimeUpdate();
    
        // 초기 적용
    apply();

    
});
