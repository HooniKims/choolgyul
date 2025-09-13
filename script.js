document.addEventListener('DOMContentLoaded', function() {
    console.log('💻 PC 전용 출결신고서 시스템 시작');
    
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
    
    // 음력 설날 근사 계산 (2040년까지 확장)
    function getLunarNewYear(year) {
        const lunarNewYears = {
            2023: '2023-01-22', 2024: '2024-02-10', 2025: '2025-01-29', 2026: '2026-02-17',
            2027: '2027-02-06', 2028: '2028-01-26', 2029: '2029-02-13', 2030: '2030-02-03',
            2031: '2031-01-23', 2032: '2032-02-11', 2033: '2033-01-31', 2034: '2034-02-19',
            2035: '2035-02-08', 2036: '2036-01-28', 2037: '2037-02-15', 2038: '2038-02-04',
            2039: '2039-01-24', 2040: '2040-02-12'
        };
        return lunarNewYears[year];
    }
    
    // 음력 추석 근사 계산 (2040년까지 확장)
    function getChuseok(year) {
        const chuseoks = {
            2023: '2023-09-29', 2024: '2024-09-17', 2025: '2025-10-06', 2026: '2026-09-25',
            2027: '2027-09-15', 2028: '2028-10-03', 2029: '2029-09-22', 2030: '2030-09-12',
            2031: '2031-10-01', 2032: '2032-09-19', 2033: '2033-09-08', 2034: '2034-09-28',
            2035: '2035-09-16', 2036: '2036-10-05', 2037: '2037-09-24', 2038: '2038-09-13',
            2039: '2039-10-02', 2040: '2040-09-21'
        };
        return chuseoks[year];
    }
    
    // 부처님오신날 근사 계산 (2040년까지 확장)
    function getBuddhasBirthday(year) {
        const buddhasBirthdays = {
            2023: '2023-05-27', 2024: '2024-05-15', 2025: '2025-05-31', 2026: '2026-05-24',
            2027: '2027-05-13', 2028: '2028-05-02', 2029: '2029-05-20', 2030: '2030-05-09',
            2031: '2031-05-28', 2032: '2032-05-16', 2033: '2033-05-06', 2034: '2034-05-25',
            2035: '2035-05-15', 2036: '2036-05-03', 2037: '2037-05-22', 2038: '2038-05-11',
            2039: '2039-05-30', 2040: '2040-05-18'
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
    
    function pad2(n) {
        return (''+n).padStart(2,'0');
    }
    
    function noZeroPad(n) {
        return ''+n;
    }

    // PC 전용 실시간 업데이트 함수
    function updateDocument() {
        console.log('💻 문서 업데이트 시작');
        
        const g = id => document.getElementById(id);
        
        // 입력값 가져오기
        const studentId = g('inpStudentId')?.value.trim() || '';
        const studentName = g('inpStudentName')?.value.trim() || '';
        const guardian = g('inpGuardianName')?.value.trim() || '';
        const teacher = g('inpTeacherName')?.value.trim() || '';
        const type = g('selType')?.value || '';
        const reason = g('selReason')?.value || '';
        const sDate = g('startDate')?.value || ''; 
        const eDate = g('endDate')?.value || ''; 
        const subDate = g('submitDate')?.value || '';
        const sPeriod = g('startPeriod')?.value === '조회' ? '조회' : (parseInt(g('startPeriod')?.value, 10) || 1); 
        const ePeriod = g('endPeriod')?.value === '조회' ? '조회' : (parseInt(g('endPeriod')?.value, 10) || sPeriod);
        const dayCount = parseInt(g('dayCount')?.value, 10) || 1;
        const notes = g('txtNotes')?.value.trim() || '';
        
        console.log(`💻 입력값: 학번=${studentId}, 이름=${studentName}, 종류=${type}`);
        
        // 상단 학번과 이름 업데이트
        const topStudentId = g('topStudentId');
        const topStudentName = g('topStudentName');
        if (topStudentId) {
            topStudentId.innerHTML = studentId ? `<span class="hrt cs10">${studentId}</span>` : '';
        }
        if (topStudentName) {
            const spacedName = studentName ? studentName.split('').join(' ') : '';
            topStudentName.innerHTML = spacedName ? `<span class="hrt cs10">${spacedName}</span>` : '';
        }
        
        // 기간 업데이트
        const period = g('periodLine');
        if (period && sDate && eDate) {
            const sd = new Date(sDate); 
            const ed = new Date(eDate); 
            const sPeriodText = sPeriod === '조회' ? '조회' : `${sPeriod}교시`;
            const ePeriodText = ePeriod === '조회' ? '조회' : `${ePeriod}교시`;
            const str = `20${pad2(sd.getFullYear()%100)}년&nbsp;&nbsp;${noZeroPad(sd.getMonth()+1)}월&nbsp;&nbsp;${noZeroPad(sd.getDate())}일&nbsp;&nbsp;${sPeriodText} ~ 20${pad2(ed.getFullYear()%100)}년&nbsp;&nbsp;${noZeroPad(ed.getMonth()+1)}월&nbsp;&nbsp;${noZeroPad(ed.getDate())}일&nbsp;&nbsp;${ePeriodText}(${dayCount}일간)`;
            period.innerHTML = `<span class="hrt cs10">${str}</span>`;
            period.classList.remove('text-justify-container');
        }
        
        // 사유 업데이트
        const reasonCell = g('reasonCell');
        if (reasonCell) {
            const map = {병원진료:'병원 진료', 미인정:'미인정', 기타:'기타'};
            let displayReason = '';
            
            if (reason === '기타') {
                const otherText = g('reasonOtherText')?.value || '';
                displayReason = otherText ? `기타(${otherText})` : '기타';
            } else {
                displayReason = map[reason] || reason;
            }
            
            reasonCell.innerHTML = reason ? `<span class='hrt cs10' style="display:block;text-align:center;">${displayReason}</span>` : '';
        }
        
        // 제출일 업데이트
        const subLine = g('submissionDateLine');
        if (subLine && subDate) {
            const d = new Date(subDate); 
            subLine.innerHTML = `&nbsp;&nbsp;20${pad2(d.getFullYear()%100)}년&nbsp;&nbsp;&nbsp;&nbsp;${noZeroPad(d.getMonth()+1)}월&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${noZeroPad(d.getDate())}일`;
        }
        
        // 이름 업데이트
        updateNameFields(studentName, guardian, teacher);
        
        // 종류에 따른 박스 표시
        updateTypeBoxes(type);
        
        // 추가사항 업데이트
        const add = g('additionalNotes'); 
        if (add) {
            add.innerHTML = notes ? `<span class='hrt cs10' style="display:block;text-align:center;">${notes.replace(/\n/g,'<br>')}</span>` : '';
        }
        
        // 담임 확인 방법 기타 내용 적용
        const confirmMethod = g('confirmMethod')?.value || '';
        const confirmMethodParens = g('confirmMethodParens');
        if (confirmMethodParens) {
            if (confirmMethod === '기타') {
                const otherText = g('confirmMethodOtherText')?.value || '';
                if (otherText) {
                    confirmMethodParens.innerHTML = `<span class="hrt cs16">(</span><span class="hrt cs16" style="flex:1;text-align:center;">${otherText}</span><span class="hrt cs16">)</span>`;
                } else {
                    confirmMethodParens.innerHTML = '<span class="hrt cs16">(</span><span class="hrt cs16">)</span>';
                }
            } else {
                confirmMethodParens.innerHTML = '<span class="hrt cs16">(</span><span class="hrt cs16">)</span>';
            }
        }
        
        // 첨부 서류 기타 내용 적용
        const attachmentType = g('attachmentType')?.value || '';
        const attachmentParens = g('attachmentParens');
        if (attachmentParens) {
            if (attachmentType === '기타') {
                const otherText = g('attachmentOtherText')?.value || '';
                if (otherText) {
                    attachmentParens.innerHTML = `<span class="hrt cs16">(</span><span class="hrt cs16" style="flex:1;text-align:center;">${otherText}</span><span class="hrt cs16">)</span>`;
                } else {
                    attachmentParens.innerHTML = '<span class="hrt cs16">(</span><span class="hrt cs16">)</span>';
                }
            } else {
                attachmentParens.innerHTML = '<span class="hrt cs16">(</span><span class="hrt cs16">)</span>';
            }
        }
        
        // 담임 확인 방법 박스 업데이트
        updateConfirmMethodBoxes(confirmMethod);
        
        // 첨부 서류 박스 업데이트
        updateAttachmentBoxes(attachmentType);
        
        console.log('💻 문서 업데이트 완료');
    }    
 
   // 이름 필드 업데이트
    function updateNameFields(studentName, guardian, teacher) {
        const g = id => document.getElementById(id);
        
        // 학생 이름 영역들
        ['studentNameArea', 'studentNamePrint'].forEach(id => {
            const element = g(id);
            if (element && studentName) {
                if (id === 'studentNameArea') {
                    const spacedName = studentName.split('').join(' ');
                    element.innerHTML = `<span class="hrt cs10">${spacedName}</span>`;
                } else {
                    element.textContent = studentName;
                }
            } else if (element) {
                element.innerHTML = '';
            }
        });
        
        // 보호자 이름 영역들
        ['guardianNameArea', 'guardianNamePrint'].forEach(id => {
            const element = g(id);
            if (element && guardian) {
                if (id === 'guardianNameArea') {
                    const spacedName = guardian.split('').join(' ');
                    element.innerHTML = `<span class="hrt cs10">${spacedName}</span>`;
                } else {
                    element.textContent = guardian;
                }
            } else if (element) {
                element.innerHTML = '';
            }
        });
        
        // 담임 이름 영역
        const teacherArea = g('teacherNameArea');
        if (teacherArea && teacher) {
            const spacedName = teacher.split('').join(' ');
            teacherArea.innerHTML = `<span class="hrt cs10">${spacedName}</span>`;
        } else if (teacherArea) {
            teacherArea.innerHTML = '';
        }
    }
    
    // 종류에 따른 박스 표시 함수
    function updateTypeBoxes(type) {
        console.log('💻 타입 박스 업데이트:', type);
        
        // 모든 박스 초기화
        const boxes = ['diseaseBox', 'etcBox', 'absentBox', 'lateBox', 'earlyBox', 'resultBox', 'resultBox2'];
        boxes.forEach(boxId => {
            const element = document.getElementById(boxId);
            if (element) {
                element.classList.remove('type-selected', 'type-selected-left', 'type-selected-right');
                element.style.border = '';
                element.style.padding = '';
            }
        });
            
        // 선택된 종류에 따라 박스 표시
        switch(type) {
            case '질병결석':
                const diseaseBox = document.getElementById('diseaseBox');
                if (diseaseBox) {
                    diseaseBox.classList.add('type-selected');
                }
                break;
            case '기타결석':
                const etcBox = document.getElementById('etcBox');
                if (etcBox) {
                    etcBox.classList.add('type-selected');
                }
                break;
            case '인정결석':
                const absentBox = document.getElementById('absentBox');
                if (absentBox) {
                    absentBox.classList.add('type-selected');
                }
                break;
            case '인정지각':
                const lateBox = document.getElementById('lateBox');
                if (lateBox) {
                    lateBox.classList.add('type-selected');
                }
                break;
            case '인정조퇴':
                const earlyBox = document.getElementById('earlyBox');
                if (earlyBox) {
                    earlyBox.classList.add('type-selected');
                }
                break;
            case '인정결과':
                const resultBox = document.getElementById('resultBox');
                const resultBox2 = document.getElementById('resultBox2');
                if (resultBox) {
                    resultBox.classList.add('type-selected-left');
                }
                if (resultBox2) {
                    resultBox2.classList.add('type-selected-right');
                }
                break;
        }
    }
    
    // 담임 확인 방법에 네모 박스 그리기 함수
    function updateConfirmMethodBoxes(selectedMethod) {
        // 기존 박스 제거
        document.querySelectorAll('#confirmMethod1, #confirmMethod2, #confirmMethod3, #confirmMethod4').forEach(el => {
            el.style.border = 'none';
        });
        
        if (selectedMethod && selectedMethod !== '기타') {
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
    
    // 초기화 함수
    function reset() {
        console.log('💻 초기화 실행');
        
        // 텍스트 입력 필드 초기화
        ['inpStudentId','inpStudentName','inpGuardianName','inpTeacherName','txtNotes'].forEach(id => {
            const el = document.getElementById(id); 
            if (el) el.value = '';
        });
        
        // 드롭다운 초기화
        ['selType','selReason','confirmMethod','attachmentType'].forEach(id => {
            const el = document.getElementById(id); 
            if (el) el.value = '';
        });
        
        // 교시 선택 초기화
        ['startPeriod','endPeriod'].forEach(id => {
            const el = document.getElementById(id); 
            if (el) el.value = '조회';
        });
        
        // 기타 입력 칸들 숨기기 및 초기화
        const otherContainers = ['reasonOtherContainer', 'confirmMethodOtherContainer', 'attachmentOtherContainer'];
        const otherTexts = ['reasonOtherText', 'confirmMethodOtherText', 'attachmentOtherText'];
        
        otherContainers.forEach(id => {
            const container = document.getElementById(id);
            if (container) container.style.display = 'none';
        });
        
        otherTexts.forEach(id => {
            const text = document.getElementById(id);
            if (text) text.value = '';
        });
        
        // 날짜 초기화
        const startDateEl = document.getElementById('startDate');
        const endDateEl = document.getElementById('endDate');
        const submitDateEl = document.getElementById('submitDate');
        const dayCountEl = document.getElementById('dayCount');
        
        if (startDateEl) startDateEl.value = toInput(today);
        if (endDateEl) endDateEl.value = toInput(today);
        if (submitDateEl) {
            const nextWorkday = getNextWorkday(today);
            submitDateEl.value = toInput(nextWorkday);
        }
        if (dayCountEl) dayCountEl.value = 1;
        
        // 문서 업데이트
        updateDocument();
    }
    
    // 반응형 출력 함수 (PC + 모바일 적응형)
    function printDocument() {
        const isMobile = window.innerWidth <= 768;
        console.log(`🖨️ 반응형 출력 실행 (${isMobile ? '모바일' : 'PC'} 모드)`);
        
        // 최신 데이터로 문서 업데이트
        updateDocument();
        
        if (isMobile) {
            // 모바일에서는 사용자에게 안내 메시지 표시
            const userAgent = navigator.userAgent.toLowerCase();
            let message = '모바일에서 출력하기:\n\n';
            
            if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
                message += '1. Safari 하단의 "공유" 버튼 터치\n2. "프린트" 선택\n3. 프린터 설정 후 출력';
            } else if (userAgent.includes('android')) {
                message += '1. Chrome 우상단 메뉴(⋮) 터치\n2. "공유" → "인쇄" 선택\n3. 프린터 설정 후 출력';
            } else {
                message += '1. 브라우저 메뉴에서 "인쇄" 선택\n2. 프린터 설정 후 출력';
            }
            
            message += '\n\n또는 키보드가 있다면 Ctrl+P를 눌러주세요.';
            
            if (confirm(message + '\n\n지금 출력 대화상자를 열까요?')) {
                setTimeout(() => {
                    window.print();
                }, 100);
            }
        } else {
            // PC에서는 바로 출력
            setTimeout(() => {
                window.print();
            }, 100);
        }
    }    
   
 // ========== PC 전용 실시간 입력 시스템 ==========
    console.log('🚀 PC 전용 실시간 입력 시스템 초기화');
    
    // 초기 날짜 설정
    const startDate = document.getElementById('startDate');
    const endDate = document.getElementById('endDate');
    const submitDate = document.getElementById('submitDate');
    
    if (startDate) startDate.value = toInput(today);
    if (endDate) endDate.value = toInput(today);
    if (submitDate) {
        const nextWorkday = getNextWorkday(today);
        submitDate.value = toInput(nextWorkday);
    }
    
    // 반응형 실시간 이벤트 리스너 설정 (PC + 모바일 적응형)
    function setupResponsiveRealTimeListeners() {
        const isMobile = window.innerWidth <= 768;
        console.log(`🔄 반응형 실시간 이벤트 리스너 설정 시작 (${isMobile ? '모바일' : 'PC'} 모드)`);
        
        // 모든 입력 필드 ID 목록
        const inputFields = [
            'inpStudentId', 'inpStudentName', 'inpGuardianName', 'inpTeacherName', 
            'txtNotes', 'selType', 'selReason', 'confirmMethod', 'attachmentType',
            'startPeriod', 'endPeriod', 'startDate', 'endDate', 'submitDate',
            'reasonOtherText', 'confirmMethodOtherText', 'attachmentOtherText'
        ];
        
        inputFields.forEach(fieldId => {
            const element = document.getElementById(fieldId);
            if (element) {
                console.log(`✅ ${fieldId} 이벤트 리스너 등록`);
                
                // 기본 이벤트 (PC + 모바일 공통)
                element.addEventListener('input', function() {
                    console.log(`📝 INPUT: ${this.id} = "${this.value}"`);
                    updateDocument();
                });
                
                element.addEventListener('change', function() {
                    console.log(`📝 CHANGE: ${this.id} = "${this.value}"`);
                    updateDocument();
                });
                
                element.addEventListener('keyup', function() {
                    console.log(`📝 KEYUP: ${this.id} = "${this.value}"`);
                    updateDocument();
                });
                
                element.addEventListener('blur', function() {
                    console.log(`📝 BLUR: ${this.id} = "${this.value}"`);
                    updateDocument();
                });
                
                // 모바일에서 추가 이벤트
                if (isMobile) {
                    element.addEventListener('touchend', function() {
                        setTimeout(() => {
                            console.log(`📱 TOUCH: ${this.id} = "${this.value}"`);
                            updateDocument();
                        }, 50);
                    });
                    
                    element.addEventListener('focus', function() {
                        console.log(`📱 FOCUS: ${this.id}`);
                        setTimeout(() => updateDocument(), 100);
                    });
                }
                
            } else {
                console.warn(`❌ 요소 없음: ${fieldId}`);
            }
        });
        
        // 날짜 필드 특별 처리
        ['startDate', 'endDate'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', function() {
                    updateWorkdayCount();
                    
                    // 종료일 변경 시 제출일 자동 업데이트
                    if (id === 'endDate' && this.value) {
                        const submitDateInput = document.getElementById('submitDate');
                        if (submitDateInput) {
                            const endDate = new Date(this.value);
                            let nextDay = new Date(endDate);
                            nextDay.setDate(nextDay.getDate() + 1);
                            
                            while (isWeekend(nextDay) || isHoliday(nextDay)) {
                                nextDay.setDate(nextDay.getDate() + 1);
                            }
                            
                            submitDateInput.value = nextDay.toISOString().slice(0, 10);
                        }
                    }
                    updateDocument();
                });
            }
        });
        
        console.log('✅ 반응형 실시간 이벤트 리스너 설정 완료');
        
        // 모바일에서 추가 폴링 지원 (이벤트가 놓칠 수 있는 경우 대비)
        if (isMobile) {
            console.log('📱 모바일 폴링 시스템 활성화');
            
            let lastValues = {};
            const pollingFields = ['inpStudentId', 'inpStudentName', 'inpGuardianName', 'inpTeacherName', 'selType'];
            
            // 초기값 저장
            pollingFields.forEach(id => {
                const element = document.getElementById(id);
                if (element) {
                    lastValues[id] = element.value;
                }
            });
            
            // 300ms마다 값 변경 체크
            setInterval(() => {
                let hasChanged = false;
                pollingFields.forEach(id => {
                    const element = document.getElementById(id);
                    if (element && element.value !== lastValues[id]) {
                        console.log(`📱 폴링 감지: ${id} = "${element.value}"`);
                        lastValues[id] = element.value;
                        hasChanged = true;
                    }
                });
                
                if (hasChanged) {
                    updateDocument();
                }
            }, 300);
        }
    }
    
    // 기타 옵션 표시/숨김 처리
    function setupOtherOptions() {
        console.log('💻 기타 옵션 설정');
        
        // 사유 기타 옵션
        const reasonSelect = document.getElementById('selReason');
        const reasonOtherContainer = document.getElementById('reasonOtherContainer');
        if (reasonSelect && reasonOtherContainer) {
            reasonSelect.addEventListener('change', function() {
                if (this.value === '기타') {
                    reasonOtherContainer.style.display = 'block';
                } else {
                    reasonOtherContainer.style.display = 'none';
                    const reasonOtherText = document.getElementById('reasonOtherText');
                    if (reasonOtherText) reasonOtherText.value = '';
                }
                updateDocument();
            });
        }
        
        // 담임 확인 방법 기타 옵션
        const confirmMethodSelect = document.getElementById('confirmMethod');
        const confirmMethodOtherContainer = document.getElementById('confirmMethodOtherContainer');
        if (confirmMethodSelect && confirmMethodOtherContainer) {
            confirmMethodSelect.addEventListener('change', function() {
                if (this.value === '기타') {
                    confirmMethodOtherContainer.style.display = 'block';
                } else {
                    confirmMethodOtherContainer.style.display = 'none';
                    const confirmMethodOtherText = document.getElementById('confirmMethodOtherText');
                    if (confirmMethodOtherText) confirmMethodOtherText.value = '';
                }
                updateDocument();
            });
        }
        
        // 첨부 서류 기타 옵션
        const attachmentSelect = document.getElementById('attachmentType');
        const attachmentOtherContainer = document.getElementById('attachmentOtherContainer');
        if (attachmentSelect && attachmentOtherContainer) {
            attachmentSelect.addEventListener('change', function() {
                if (this.value === '기타') {
                    attachmentOtherContainer.style.display = 'block';
                } else {
                    attachmentOtherContainer.style.display = 'none';
                    const attachmentOtherText = document.getElementById('attachmentOtherText');
                    if (attachmentOtherText) attachmentOtherText.value = '';
                }
                updateDocument();
            });
        }
    }
    
    // 버튼 이벤트 리스너
    function setupButtons() {
        console.log('💻 버튼 이벤트 설정');
        
        const resetBtn = document.getElementById('btnReset');
        const printBtn = document.getElementById('btnPrint');
        
        if (resetBtn) {
            resetBtn.addEventListener('click', function(e) {
                e.preventDefault();
                reset();
            });
            console.log('✅ 초기화 버튼 이벤트 등록');
        }
        
        if (printBtn) {
            printBtn.addEventListener('click', function(e) {
                e.preventDefault();
                printDocument();
            });
            console.log('✅ 출력 버튼 이벤트 등록');
        }
    }
    
    // 초기화 실행
    setupResponsiveRealTimeListeners();
    setupOtherOptions();
    setupButtons();
    
    // 초기 영업일 계산
    updateWorkdayCount();
    
    // 초기 문서 업데이트
    updateDocument();
    
    // 화면 크기 변경 감지 (PC ↔ 모바일 전환)
    window.addEventListener('resize', function() {
        const isMobile = window.innerWidth <= 768;
        console.log(`📐 화면 크기 변경 감지: ${isMobile ? '모바일' : 'PC'} 모드`);
        
        // 화면 크기 변경 시 문서 업데이트
        setTimeout(() => {
            updateDocument();
        }, 100);
    });
    
    // 모바일에서 가상 키보드 감지
    if (window.innerWidth <= 768) {
        let initialHeight = window.innerHeight;
        window.addEventListener('resize', function() {
            const heightDiff = Math.abs(window.innerHeight - initialHeight);
            if (heightDiff > 100) {
                console.log('📱 가상 키보드 변화 감지');
                setTimeout(() => {
                    updateDocument();
                }, 200);
            }
        });
    }
    
    console.log('🎉 반응형 출결신고서 시스템 초기화 완료');
    
});