// src/App.js
import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Table, Button } from 'antd';

const estatusOptions = ['En curso', 'Stand by', 'Terminado'];

function App() {
  const [clientes, setClientes] = useState([]);
  const [clienteNombre, setClienteNombre] = useState('');
  const [nombre, setNombre] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [mapa, setMapa] = useState('');
  const [estatus, setEstatus] = useState('');
  const [currentClienteId, setCurrentClienteId] = useState(null);

  useEffect(() => {
    const getClientes = async () => {
      const datos = await getDocs(collection(db, 'Proyectos'));
      setClientes(datos.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };
    getClientes();
  }, []);

  const agregarCliente = async (e) => {
    e.preventDefault();
    if (!clienteNombre.trim() || !nombre.trim() || !ubicacion.trim() || !mapa.trim() || !estatus.trim()) {
      console.log('Todos los campos son obligatorios');
      return;
    }

    try {
      const nuevoCliente = {
        clienteNombre,
        nombre,
        ubicacion,
        mapa,
        estatus
      };
      const docRef = await addDoc(collection(db, 'Proyectos'), nuevoCliente);
      setClientes([...clientes, { ...nuevoCliente, id: docRef.id }]);
      setClienteNombre('');
      setNombre('');
      setUbicacion('');
      setMapa('');
      setEstatus('');
    } catch (error) {
      console.log(error);
    }
  };

  const editarCliente = (cliente) => {
    setClienteNombre(cliente.clienteNombre);
    setNombre(cliente.nombre);
    setUbicacion(cliente.ubicacion);
    setMapa(cliente.mapa);
    setEstatus(cliente.estatus);
    setCurrentClienteId(cliente.id);
  };

  const actualizarCliente = async (e) => {
    e.preventDefault();
    if (!clienteNombre.trim() || !nombre.trim() || !ubicacion.trim() || !mapa.trim() || !estatus.trim()) {
      console.log('Todos los campos son obligatorios');
      return;
    }

    try {
      const clienteDoc = doc(db, 'Proyectos', currentClienteId);
      await updateDoc(clienteDoc, {
        clienteNombre,
        nombre,
        ubicacion,
        mapa,
        estatus
      });
      const datos = await getDocs(collection(db, 'Proyectos'));
      setClientes(datos.docs.map(doc => ({ ...doc.data(), id: doc.id })));
      setClienteNombre('');
      setNombre('');
      setUbicacion('');
      setMapa('');
      setEstatus('');
      setCurrentClienteId(null);
    } catch (error) {
      console.log(error);
    }
  };

  const eliminarCliente = async (id) => {
    try {
      await deleteDoc(doc(db, 'Proyectos', id));
      const arrayFiltrado = clientes.filter(item => item.id !== id);
      setClientes(arrayFiltrado);
    } catch (error) {
      console.log(error);
    }
  };

  const columns = [
    {
      title: 'Nombre del Cliente',
      dataIndex: 'clienteNombre',
      filters: clientes.map(cliente => ({
        text: cliente.clienteNombre,
        value: cliente.clienteNombre,
      })),
      onFilter: (value, record) => record.clienteNombre.indexOf(value) === 0,
    },
    {
      title: 'Nombre del Proyecto',
      dataIndex: 'nombre',
      sorter: (a, b) => a.nombre.length - b.nombre.length,
    },
    {
      title: 'Ubicación',
      dataIndex: 'ubicacion',
    },
    {
      title: 'Estatus del Proyecto',
      dataIndex: 'estatus',
      filters: estatusOptions.map(estatus => ({
        text: estatus,
        value: estatus,
      })),
      onFilter: (value, record) => record.estatus === value,
    },
    {
      title: 'Acciones',
      dataIndex: 'acciones',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => editarCliente(record)}>Editar</Button>
          <Button type="link" onClick={() => eliminarCliente(record.id)}>Eliminar</Button>
        </>
      ),
    },
  ];

  const onChange = (pagination, filters, sorter, extra) => {
    console.log('params', pagination, filters, sorter, extra);
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col">
          <h2>Clientes</h2>
          <Table
            columns={columns}
            dataSource={clientes.map(cliente => ({ ...cliente, key: cliente.id }))}
            onChange={onChange}
            pagination={{ pageSize: 5 }}
          />
        </div>
        <div className="col">
          <h2>{currentClienteId ? 'Editar Cliente' : 'Agregar Cliente'}</h2>
          <form onSubmit={currentClienteId ? actualizarCliente : agregarCliente}>
            <input type="text" className="form-control mb-2" placeholder="Ingrese el cliente" value={clienteNombre} onChange={e => setClienteNombre(e.target.value)} />
            <input type="text" className="form-control mb-2" placeholder="Ingrese el nombre" value={nombre} onChange={e => setNombre(e.target.value)} />
            <input type="text" className="form-control mb-2" placeholder="Ingrese la ubicación" value={ubicacion} onChange={e => setUbicacion(e.target.value)} />
            <input type="text" className="form-control mb-2" placeholder="Ingrese el mapa" value={mapa} onChange={e => setMapa(e.target.value)} />
            <select className="form-control mb-2" value={estatus} onChange={e => setEstatus(e.target.value)}>
              <option value="">Seleccione el estatus</option>
              {estatusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            <button className="btn btn-primary btn-block" type="submit">{currentClienteId ? 'Editar' : 'Agregar'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
