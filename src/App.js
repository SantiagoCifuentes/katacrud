import React, { createContext, useContext, useReducer, useEffect, useRef, useState } from 'react';


const HOST_API = "http://localhost:8080/api";
const initialState = {
  list: [],
  item: {}
};
const Store = createContext(initialState);

const Form = () => {
  const formRef = useRef(null); //identifica las propiedades de un componente en especifico

  const {dispatch, state: {item}} = useContext(Store);//el item que se llama acá es el del initial state
  const [state, setState] = useState({item}); //previene que se utilice el submit si no se da click


  const onAdd = (event) => {
    event.preventDefault();

    const request = {
      name: state.name,
      id: null,
      isCompleted: false
    };

    fetch(HOST_API+"/todo", {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        "Content-type": "application/json"
      }
    })
    .then(response => response.json()) //promesa que sirve para borrar los campos dentro del formulario
    .then((todo) => {
      dispatch({ type: "add-item", item: todo});
      setState({ name: ""});
      formRef.current.reset();
    });
  }

  const onEdit = (event) => {
    event.preventDefault(); //previene que se utilice el submit si no se da click

    const request = {
      name: state.name,
      id: item.id,
      isCompleted: item.isCompleted
    };

    fetch(HOST_API+"/todo", {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        "Content-type": "application/json"
      }
    })
    .then(response => response.json()) //promesa que sirve para borrar los campos dentro del formulario,lo actualiza
    .then((todo) => {
      dispatch({ type: "update-item", item: todo});
      setState({ name: ""});
      formRef.current.reset();
    });
  }

  return <div className='container'>
    <form ref={formRef}>
    
      <input type="text" name='name'  defaultValue={item.name} onChange={(event) => { ////onChange sirve para que cada vez que el usuario  typee se agrega el nombre y  se guarda el estado
        setState({ ...state, name:event.target.value })
      }}/>
      {item.id && <button  className='btn btn-success' onClick={onEdit}>Actualizar</button>}
      {!item.id && <button className='btn btn-success' onClick={onAdd}>Agregar</button>}    
    </form>
  </div> 
}

const List = () => {

  const {dispatch, state} = useContext(Store); //guarda los estados de la app

  useEffect(() => { //consulta de http, promesa
    fetch(HOST_API+"/todos")
    .then(response => response.json())
    .then((list) => {
      dispatch({type: "update-list", list})//el dispatch actualiza la lista
    })
  }, [state.list.length, dispatch]);

  const onDelete = (id) => {
    fetch(HOST_API+"/todo/"+id, {
      method: "DELETE"
    })
    .then((list) => {
      dispatch({ type: "delete-item", id}) //esta línea es como la condición, es decir que para que esta función entre en acción, tiene que haber una lista
    })
  };

  const onEdit = (todo) => {
    dispatch({ type: "edit-item", item: todo})
  }

  return <div className='container'>
    <table className='table table-primary'>
      <thead>
        <tr>
          <td>ID</td>
          <td>Nombre</td>
          <td>Esta completado?</td>
        </tr>
      </thead>
      <tbody>
        {
          state.list.map((todo) => {
            return <tr key={todo.id}>
              <td>{todo.id}</td>
              <td>{todo.name}</td>
              <td>{todo.isCompleted === true ? "SI" : "NO"}</td>
              <td><button className='btn btn-danger' onClick={() => onDelete(todo.id)}>Eliminar</button></td>
              <td><button className='btn btn-warning' onClick={() => onEdit(todo)}>Editar</button></td>
            </tr>
          })
        }
      </tbody>
    </table>
  </div>
}

function reducer(state, action) {
  switch (action.type) {
    case 'update-item':
      const listUpdateEdit = state.list.map((item) => { //itera los elementos y cuando exista el item que se está buscando, lo devuelve
        if (item.id === action.item.id){
          return action.item;
        }
        return item;
      });
      return { ...state, list: listUpdateEdit, item: {} }
    case 'delete-item':
      const listUpdate = state.list.filter((item) => {
        return item.id !== action.id;
      });
      return { ...state, list: listUpdate }
    case 'update-list':
      return { ...state, list: action.list }
    case 'edit-item':
      return { ...state, item: action.item }
    case 'add-item':
      const newList = state.list;
      newList.push(action.item);
      return { ...state, list:newList}
    default:
      return state;
  }
}

const StoreProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return <Store.Provider value={ {state, dispatch} //el dispatch es el método que permite enviar los cambios necesarios, como agregar o actualizar
   }>
    {children}
  </Store.Provider>
}

function App() {
  return (
    <StoreProvider>
      <Form />
      <List />
    </StoreProvider>
  );
}

export default App;
  
