let promise = new Promise(function(resolve, reject) {
    // 프라미스가 만들어지면 executor 함수(new Promise의 인수)
    // 는 자동으로 실행

    // 1초 뒤에 일이 성공적으로 끝났다는 신호가 전달되면서
    // result는 'done'이 된다.
    setTimeout(()=> resolve("done"), 1000);
});

// executor는 new Promise에 자동으로 그리고 즉각적으로 호출된다.
// executor의 인자로 resolve와 reject 함수를 받는다. 이 함수들은 
// 자바스크립트 엔진이 미리 정의한 함수이므로 개발자가 따로 만들
// 필요는 없다. 다만, resolve나 reject 중 하나를 반드시 호출해야한다.

// executor 처리가 시작된 지 1초 후에 resolve("done")이 호출되고, 
// promise 객체의 상태는 fullfilled로 변한다. 이처럼 일이 성공적
// 으로 처리되었을 때의 프라미스를 'fulfilled promise(약속이 이행
// 된 프라미스)라고 부른다. 

// 프라미스 객체의 state, result 프로퍼티는 내부 프로퍼티이므로 개발
// 자가 직접 접근할 수 없다. .then / .catch/ .finally 메서드를 이용해
// 야 접근가능해진다. 

// resolve 함수는 .then의 첫 번째 함수(인수)를 실행한다.  
promise.then(
    result => alert(result), // 1초 후 "done!"을 출력
    error => alert(error) // 실행되지 않음
)

// 콜백 기반
function loadScript(src, callback) {
    let script = document.createElement('script');
    script.src = scr;

    script.onload = () => callback(null, script);
    script.onerror = () => callback(new Error(`${src}를 불러오는 도중에 에러가 발생`));

    document.head.append(script);
}

 // 프라미스 기반
function loadScript(src) {
    return new Promise(function(resolve, reject){
        let script = document.createElement('script');
        script.src = src;

        script.onload = () => resolve(script);
        script.onerror = () => reject(new Error(`${src}를 불러오는 도중에 에러가 발생`));

        document.head.append(script);
    })
}

// 사용
let promise = loadScript("https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.11/lodash.js");

promise.then(
    script => alert(`${script.src}을 불러왔습니다!`),
    error => alert(`Error: ${error.message}`)
);

promise.then(script => alert('또다른 핸들러...'));

// 프라미스 체이닝

new Promise(function(resolve, reject) {

    setTimeout(() => resolve(1), 1000); 
    
    }).then(function(result) { 
    
        alert(result); // 1
        return result * 2;
    
    }).then(function(result) { 
    
        alert(result); // 2
        return result * 2;
    
    }).then(function(result) {
    
        alert(result); // 4
        return result * 2;
        
    });


// 프라미스 체이닝이 가능한 이유는 promise.then을 호출하면 프라미스가
// 반환되기 때문이다. 반환된 프라미스엔 당연히 .then을 호출할 수 있다.

// 한편 핸들러가 값을 반환할 때엔 이 값이 프라미스의 result가 됩니다.
// 따라서 다음 .then은 이 값을 이용해 호출됩니다.