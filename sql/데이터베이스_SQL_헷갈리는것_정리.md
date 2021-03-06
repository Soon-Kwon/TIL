# SQL 헷갈리는 것들 정리

## ORA-01417: A TABLE MAY BE OUTER JOINED TO AT MOST ONE OTHER TABLE (11g 버전에서)
원인: 한 테이블에 최대 OUTER JOIN은 한 개 이상이 되면 안됨
```
WITH TEST1 AS(
SELECT '1' NO, '1A' VAL FROM DUAL
UNION ALL
SELECT '2' NO, '1B' VAL FROM DUAL
UNION ALL
SELECT '3' NO, '1C' VAL FROM DUAL
UNION ALL
SELECT '4' NO, '1D' VAL FROM DUAL
UNION ALL
SELECT '5' NO, '1E' VAL FROM DUAL
)
,
TEST2 AS (
SELECT '1' NO, '2A' VAL FROM DUAL
UNION ALL
SELECT '3' NO, '2B' VAL FROM DUAL
UNION ALL
SELECT '5' NO, '2C' VAL FROM DUAL
UNION ALL
SELECT '7' NO, '2D' VAL FROM DUAL
UNION ALL
SELECT '9' NO, '2E' VAL FROM DUAL
)
,
TEST3 AS(
SELECT '1' NO, '3A' VAL FROM DUAL
UNION ALL
SELECT '4' NO, '3B' VAL FROM DUAL
UNION ALL
SELECT '5' NO, '3C' VAL FROM DUAL
UNION ALL
SELECT '9' NO, '3D' VAL FROM DUAL
UNION ALL
SELECT '11' NO, '3E' VAL FROM DUAL
UNION ALL
SELECT '13' NO, '3F' VAL FROM DUAL
)
SELECT * 
FROM TEST1 A
   , TEST2 B
   , TEST3 C
WHERE A.NO = B.NO(+)
  AND C.NO = B.NO(+);
```
19C 버전에서는 위 쿼리가 실행 가능하다.
```
1.      A.NO = B.NO(+)  
    AND B.NO = C.NO(+)  
   => A, B OUTER JOIN => 결과테이블과 C OUTER JOIN

2. A LEFT OUTER JOIN B   
     ON A.NO = B.NO  
     LEFT OUTER JOIN C  
     ON B.NO = C.NO 
   => A, B OUTER JOIN => 결과테이블과 C OUTER JOIN (1번과 동일)

3.     A.NO = B.NO(+)
   AND C.NO = B.NO(+)
   => A, C 카타시안곱 !! => 결과테이블, B OUTER JOIN  
   => 1, 2번과 같은 결과라고 착각했으나 전혀 다른 결과가 
```

## TO_CHAR로 숫자를 변환할 때 공백이 생기는 이유와 해결방법

숫자를 문자로 변환할 때 가장 많이 사용하는 함수. TO_CHAR    
가끔 변환된 문자열앞에 공백이 붙는경우가 있음.    
이유는 숫자인 경우 양수는 공백, 음수는 '-'가 붙는다.     
없애는 방법은 형식에 'FM'을 넣으면 해결.     

```sql
SELECT TO_CHAR(999, '000') FROM DUAL; -- 결과 ' 999'
SELECT TO_CHAR(999, 'FM000') FROM DUAL; -- 결과 '999'
SELECT TRIM(TO_CHAR(999, '000')) FROM DUAL; -- 결과 TRIM(' 999')
```
## OUTER JOIN 시 착각하기 쉬운 것
OUTER JOIN을 하게되면 뭔가 DRIVING TABLE의 ROW 수가 100건이면 100건의 결과만 나와야 될 것 같은 착각을 했다. LEFT OUTER JOIN을 기준으로 1:M의 관계인 경우, 결과 집합의 내용은 LEFT 기준이지만 결과집합의 건수는 RIGHT가 기준이다. 즉 내용은 DRIVING TALBE의 100건에 해당하는 내용이 모두 존재하고, 만약 DRIVEN TABLE에 여러 행이 조건에 일치한다면 100 + a 의 결과 건수가 되는 것이다. INNER JOIN 시에는 건수에 신경안쓰다가, OUTER JOIN 시에 왠지 건수가 기준 테이블 건수와 같아야 된다는 잘못된 생각을 했다.  

## 오라클 날짜,  시간 차이 계산 방법
```sql

날짜 차이 : 종료일자(YYYY-MM-DD) - 시작일자(YYYY-MM-DD)
시간 차이 : (종료일시(YYYY-MM-DD HH:MI:SS) - 시작일시(YYYY-MM-DD HH:MI:SS)) * 24
분 차이 : (종료일시(YYYY-MM-DD HH:MI:SS) - 시작일시(YYYY-MM-DD HH:MI:SS)) * 24 * 60
초 차이 : (종료일시(YYYY-MM-DD HH:MI:SS) - 시작일시(YYYY-MM-DD HH:MI:SS)) * 24 * 60 * 60

종료일자에서 시작일자를 빼면 차이 값이 '일' 기준의 수치 값으로 반환된다.
계산된 값을 시, 분, 초로 변환하기 위해서는 환산값(24*60*60)을 곱해주어야 한다.

SELECT TO_DATE('2021-05-08', 'YYYY-MM-DD') - TO_DATE('2021-05-01', 'YYYY-MM-DD')
FROM dual

결과: 7
```

## 오라클 NULL
오라클에서 빈 문자열('')은 NULL로 인식하기 때문에, 컬럼의 값이 빈 문자열이면 NULL과 동일한 조건으로 쿼리를 작성해야 한다.

## NVL 함수
주의할 점: 조사할 컬럼과 치환할 값의 데이터 타입이 같아야 한다. 

## GROUP BY 없이 단독으로 HAVING이 오는 경우
GROUP BY와 HAVING은 짝꿍이라고 생각했다. HAVING이 주로 GROUP BY절 뒤에 오는 것은 맞지만, 그렇지 않은 경우도 존재한다. 만약 테이블 전체가 한 개의 그룹이 되는 경우 GROUP BY 없이 단독으로 HAVING을 사용할 수 있다. 
```sql
SELECT COUNT(*) "전체 행수", COUNT(HEIGHT) "키 건수", 
        MAX(HEIGHT) 최대키, MIN(HEIGHT) 최소키, 
        ROUND(AVG(HEIGHT),2) 평균키 
FROM PLAYER;
HAVING MAX(HEIGHT) > 170
```

## CUBE 함수
```
SELECT A.ID, B.CODE, B.QUAN, SUM(B.QUAN)
FROM A INNER JOIN B
ON A.ID = B.ID
GROUP BY CUBE(A.ID, B.CODE, (B.CODE, B.QUAN))
ORDER BY A.ID, B.CODE, B.QUAN;

ID	CODE	QUAN        SUM(B.QUAN)
1	ELECTRO	100	100
1	ELECTRO	100	100
1	ELECTRO	 - 	100
1	WATER	200	200
1	WATER	200	200
1	WATER	 - 	200
1	WIND	300	300
1	WIND	300	300
1	WIND	 - 	300
1	 - 	 - 	600
2	ELECTRO	200	200
2	ELECTRO	200	200
2	ELECTRO	 - 	200
2	WATER	300	300
2	WATER	300	300
2	WATER	 - 	300
2	 - 	 - 	500
3	ELECTRO	300	300
3	ELECTRO	300	300
3	ELECTRO	 - 	300
3	 - 	 - 	300
 - 	ELECTRO	100	100
 - 	ELECTRO	100	100
 - 	ELECTRO	200	200
 - 	ELECTRO	200	200
 - 	ELECTRO	300	300
 - 	ELECTRO	300	300
 - 	ELECTRO	 - 	600
 - 	WATER	200	200
 - 	WATER	200	200
 - 	WATER	300	300
 - 	WATER	300	300
 - 	WATER	 - 	500
 - 	WIND	300	300
 - 	WIND	300	300
 - 	WIND	 - 	300
 - 	 - 	 - 	1400

```
이린식으로 쿼리가 있을 때 CUBE 함수는 모든 경우의 수를 출력하고(위에서는 2^3 = 8가지 케이스) 각각의 소계를 출력해준다고 생각하면 된다. 여기서 (B.CODE, B.QUAN)가 이해가 안되었는데, A.ID를 A, B.CODE를 B, B.QUAN을 C라고 했을 때 조합이 (A,B,(B,C)), (A,B), (B,(B,C)), ((B,C), A), (A), (B), ((B,C)), () 이다. 여기서 (A,B,(B,C)), (B,(B,C)), ((B,C), A), ((B, C))에 B가 중복되어 같은 데이터가 테이블로 출력되는 것처럼 보인다. 그러나 인간이 보기에는 같은 데이터일지는 몰라도 오라클은 B와 (B, C)를 독립적인 컬럼으로 인식하고 각각을 중복되지 않는 데이터로 인식하기 때문에 위와같이 중복되는 행들이 출력되는 것이다. 때문에 (A,<u>**B**</u>,(B,C)) 와 ((<u>**B**</u>,C), A) 총계는 중복된 것처럼 보여 두 번씩 나타나고 있고, 마찬가지로 (B,(B,C))와 ((B,C)) 총계 역시 두 번 나타나는 거슬 볼 수 있다. 같은 통계인 것처럼 보이지만 사실 각각 다른 통계를 나타내는 것이다

## INSERT문에 SELECT문
```sql 
INSERT INTO 목적지테이블
(컬럼명1, 컬럼명2, 컬럼명3)
SELECT 컬럼명1, 컬럼명2, 컬럼명3
FROM 출발지테이블
```

## WHERE 1=1 사용이유
1. 쿼리 디버깅 시, 주석처리가 편하다.
2. 동적쿼리에서 특정상황마다 WHERE 절을 다르게줘야 할 때 편하다.
   ```
    SELECT * FROM EMPLOYEE
        IF A가 NULL이 아니면 
            WHERE EMPLOYEE_ID = A
        IF B가 NULL이 아니면
            IF A가 NULL이 아니면
                AND
            ELSE 
                WHERE
            EMPLOYEE_NAME = B

    SELECT * FROM EMPLOYEE WHERE 1=1
        IF A가 NULL이 아니면
            WHERE EMPLOYEE_ID = A
        IF B가 NULL이 아니면
            WHERE EMPLOYEE_NAME = B
   ```
