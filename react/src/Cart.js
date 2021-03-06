import React from 'react';
import {Table} from 'react-bootstrap';
import { connect } from 'react-redux';

function Cart(props){
    return(
        <div>
            <Table striped bordered hover variant="dark">
                <thead>
                    <tr>
                    <th>#</th>
                    <th>상품명</th>
                    <th>수량</th>
                    <th>변경</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        props.state.map((a,i)=>{
                            return(
                                <tr key={i}>
                                <td>{ a.id}</td>
                                <td>{ a.name }</td>
                                <td>{ a.quan }</td>
                                <td>
                                    <button onClick={()=>{ props.dispatch({ type : '수량증가', 데이터 : a.id - 1 })}}>+</button>
                                    <button onClick={()=>{ props.dispatch({ type : '수량감소', 데이터 : a.id - 1 })}}>-</button>
                                </td>
                                </tr>
                            )
                        })

                    }
                </tbody>
            </Table>  
            {
                props.alert열렸니 === true 
                ? (    
                <div className="my-alert">
                <p>지금 구매하시면 신규할인 20%</p>
                <button onClick={ ()=>{ props.dispatch({ type : 'alert닫기' }) }}>닫기</button>
                </div>)
                : null
            }        
        </div>
    )
}

function state를props화(state){
    console.log(state);
    return{
        state : state.reducer,
        alert열렸니 : state.reducer2
    }
}

export default connect(state를props화)(Cart)
//export default Cart;