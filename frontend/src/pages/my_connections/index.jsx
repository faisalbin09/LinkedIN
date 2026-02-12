import React, { useEffect, useState } from 'react'
import UserLayout from '@/layout/UserLayout';
import DashboardLayout from '@/layout/dashboardLayout';
import { useDispatch, useSelector } from 'react-redux';
import { getMyConnectionRequests, acceptConnectionRequest, rejectConnectionRequest } from '@/config/redux/action/authAction';
import styles from './index.module.css';
import { BASE_URL } from '@/config';
import { useRouter } from 'next/router';


export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const [loading, setLoading] = useState({});
  const router = useRouter();

  console.log("authState:", authState);

  useEffect(() => {
    dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
  }, [dispatch]);

  useEffect(() => {
    if (authState.connectionRequest && authState.connectionRequest.length > 0) {
      console.log("Connection requests updated:", authState.connectionRequest);
    }
  }, [authState.connectionRequest]);

  const handleAccept = async (requestId) => {
    setLoading(prev => ({ ...prev, [requestId]: 'accepting' }));
    try {
      await dispatch(acceptConnectionRequest({
        token: localStorage.getItem("token"),
        requestId
      }));
      // Refresh the connection requests
      await dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
      alert("Connection accepted!");
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("Failed to accept connection request");
    } finally {
      setLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  const handleReject = async (requestId) => {
    setLoading(prev => ({ ...prev, [requestId]: 'rejecting' }));
    try {
      await dispatch(rejectConnectionRequest({
        token: localStorage.getItem("token"),
        requestId
      }));
      // Refresh the connection requests
      await dispatch(getMyConnectionRequests({ token: localStorage.getItem("token") }));
      alert("Connection rejected!");
    } catch (error) {
      console.error("Error rejecting request:", error);
      alert("Failed to reject connection request");
    } finally {
      setLoading(prev => ({ ...prev, [requestId]: null }));
    }
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <h1>My Connections</h1>
         { authState.connectionRequest.length === 0 && <h1>My Connection Requests</h1> }

        {Array.isArray(authState.connectionRequest) &&
          authState.connectionRequest.map((user, index) => {
            return (
              <div onClick={
                  router.push(`/view_profile/${user?.userId?.username}`)
              } 
               className={styles.userCard} key={index}>
                <div style={{ display: "flex", alignItems: "center", gap:"2rem" }}>

                  <div className={styles.profilePicture}>
                    <img
                      src={`${BASE_URL}/${user?.userId?.profilePicture}`}
                      alt=""
                    />
                  </div>

                  <div className={styles.userInfo}>
                    <h3>{user?.userId?.name}</h3>
                    <p>{user?.userId?.username}</p>
                  </div>
                  <button onClick={(e)=>{
                    e.stopPropagation();
                    dispatch(acceptConnectionRequest({
                      connectionId : user._id,
                      token : localStorage.getItem("token"),
                      action : 'accept'
                    }))
                  }}
                   className={styles.connectedButton}>Accept</button>

                </div>
              </div>
            );
          })}


      </DashboardLayout>
    </UserLayout>
  );
}