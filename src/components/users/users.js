import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";
import Header from "../header";
import ProductList from "../products/products";
const UsersList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState({});

  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      debugger;
      setUsers(res.data);
    };
    fetchUsers();
  }, []);

  return (
    <div>
      <Header />

      <button onClick={() => navigate(-1)}>Back</button>
      <h1>Users</h1>

      <table border={1}>
        <thead>
          <th>username</th>
          <th>email</th>
          <th>isAdmin</th>
        </thead>

        <tbody>
          {users.length > 0 &&
            users.map((user) => {
              return (
                <tr>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.isAdmin ? "Yes" : "No"}</td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default UsersList;
