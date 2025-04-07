"use client";
import { useState } from 'react';

const AdminUsersList = ({ 
  users, 
  bannedUsers,
  loading, 
  onBanClick, 
  onUnbanUser 
}) => {
  
  const isBanned = (userId) => {
    return bannedUsers.some(bannedUser => bannedUser.userId === userId);
  };

  const getBanInfo = (userId) => {
    return bannedUsers.find(bannedUser => bannedUser.userId === userId);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c6ca8]"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.length > 0 ? (
            users.map((user) => {
              const banned = isBanned(user.id);
              const banInfo = banned ? getBanInfo(user.id) : null;
              
              return (
                <tr key={user.id} className={`${banned ? 'bg-red-50' : ''}`}>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{user.name}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs text-gray-500">{user.id}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {banned ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Banned
                        {banInfo?.bannedUntil && (
                          <> until {new Date(banInfo.bannedUntil).toLocaleDateString()}</>
                        )}
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                    {user.role !== 'admin' && (
                      <>
                        {banned ? (
                          <button 
                            onClick={() => onUnbanUser(user.id)}
                            className="text-indigo-600 hover:text-indigo-900 mr-3"
                            disabled={loading}
                          >
                            Unban
                          </button>
                        ) : (
                          <button 
                            onClick={() => onBanClick(user)}
                            className="text-red-600 hover:text-red-900"
                            disabled={loading}
                          >
                            Ban
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="6" className="px-4 py-4 text-center text-gray-500">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsersList;