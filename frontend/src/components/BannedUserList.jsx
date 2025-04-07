"use client";

const BannedUserList = ({ bannedUsers, loading, onUnbanUser }) => {
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
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Reason</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Ban Duration</th>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {bannedUsers.length > 0 ? (
            bannedUsers.map((user) => (
              <tr key={user.id} className="bg-red-50">
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-gray-500">{user.email}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="text-gray-500">{user.reason || 'No reason provided'}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {user.bannedUntil ? (
                    <div className="text-gray-500">
                      Until {new Date(user.bannedUntil).toLocaleDateString()}
                    </div>
                  ) : (
                    <div className="text-gray-500">Permanent</div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">
                  <button 
                    onClick={() => onUnbanUser(user.userId)}
                    className="text-indigo-600 hover:text-indigo-900"
                    disabled={loading}
                  >
                    Unban
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                No banned users found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BannedUserList;