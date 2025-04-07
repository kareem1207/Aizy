"use client";
import { useEffect, useState } from 'react';
import { useUserStore } from '@/store/userStore';
import jwt from 'jsonwebtoken';
import { useRouter } from 'next/navigation';
import { BanDialogueBox } from '@/components/BanDialogueBox';
import { AddAdminForm } from '@/components/AddAdminForm';

export const Admin = () => {
    const router = useRouter();
    const { getAllUsers, getBannedUsers, banUser, unbanUser, users, bannedUsers } = useUserStore();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('users');
    const [currentUser, setCurrentUser] = useState(null);
    
    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    const [showAddAdminForm, setShowAddAdminForm] = useState(false);
    
    const [actionMessage, setActionMessage] = useState('');
    const [actionStatus, setActionStatus] = useState('');

    useEffect(() => {
        const token = localStorage.getItem("user_login_token");
        if (token) {
            try {
                const decoded = jwt.decode(token);
                setCurrentUser(decoded);
                
                if (decoded?.role !== 'admin') {
                    router.push('/');
                    return;
                }
                loadData();
            } catch (error) {
                console.error("Error decoding token:", error);
                router.push('/login');
            }
        } else {
            router.push('/login');
        }
    }, [router]);

    const loadData = async () => {
        setLoading(true);
        setError('');
        
        try {
            const usersResult = await getAllUsers();
            const bannedUsersResult = await getBannedUsers();
            
            if (!usersResult.success) {
                setError(usersResult.message || 'Failed to load users');
            }
            
            if (!bannedUsersResult.success) {
                setError(prev => prev ? `${prev}. ${bannedUsersResult.message}` : bannedUsersResult.message || 'Failed to load banned users');
            }
        } catch (err) {
            setError('Error loading data. Please try again.');
            console.error('Error loading admin data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBanClick = (user) => {
        setSelectedUser(user);
        setShowBanModal(true);
    };

    const handleBanUser = async (reason, duration) => {
        if (!selectedUser) return;
        
        setLoading(true);
        try {
            const result = await banUser(selectedUser.id, reason, duration);
            
            if (result.success) {
                setActionStatus('success');
                setActionMessage(result.message || 'User banned successfully');
                await loadData();
            } else {
                setActionStatus('error');
                setActionMessage(result.message || 'Failed to ban user');
            }
        } catch (err) {
            setActionStatus('error');
            setActionMessage('Error banning user. Please try again.');
            console.error('Error banning user:', err);
        } finally {
            setLoading(false);
            setShowBanModal(false);
        }
    };

    const handleUnbanUser = async (userId) => {
        setLoading(true);
        try {
            const result = await unbanUser(userId);
            
            if (result.success) {
                setActionStatus('success');
                setActionMessage(result.message || 'User unbanned successfully');
                await loadData();
            } else {
                setActionStatus('error');
                setActionMessage(result.message || 'Failed to unban user');
            }
        } catch (err) {
            setActionStatus('error');
            setActionMessage('Error unbanning user. Please try again.');
            console.error('Error unbanning user:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdminSuccess = () => {
        setShowAddAdminForm(false);
        setActionStatus('success');
        setActionMessage('Admin created successfully');
        loadData();
    };

    const isBanned = (userId) => {
        return bannedUsers.some(bannedUser => bannedUser.userId === userId);
    };

    const getBanInfo = (userId) => {
        return bannedUsers.find(bannedUser => bannedUser.userId === userId);
    };

    return (
        <div className="min-h-screen bg-[#fffcf6] text-[#3c6ca8] p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-xl p-6 transition-all hover:shadow-lg">
                <div className="flex flex-col md:flex-row justify-between items-center mb-8 border-b border-[#3c6ca8]/20 pb-4">
                    <h1 className="text-3xl font-bold text-center md:text-left mb-4 md:mb-0">
                        Admin Dashboard
                    </h1>
                    
                    <button 
                        onClick={() => setShowAddAdminForm(true)}
                        className="w-full md:w-auto px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 font-medium flex items-center justify-center"
                        disabled={loading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Admin
                    </button>
                </div>
                
                <div className="mb-6">
                    <div className="flex border-b border-[#3c6ca8]/20">
                        <button 
                            onClick={() => {
                                setActiveTab('users');
                                setShowAddAdminForm(false);
                            }}
                            className={`px-4 py-2 font-medium ${
                                activeTab === 'users' && !showAddAdminForm
                                    ? 'text-[#3c6ca8] border-b-2 border-[#3c6ca8]' 
                                    : 'text-gray-500 hover:text-[#3c6ca8]'
                            }`}
                        >
                            All Users
                        </button>
                        <button 
                            onClick={() => {
                                setActiveTab('banned');
                                setShowAddAdminForm(false);
                            }}
                            className={`px-4 py-2 font-medium ${
                                activeTab === 'banned' && !showAddAdminForm
                                    ? 'text-[#3c6ca8] border-b-2 border-[#3c6ca8]' 
                                    : 'text-gray-500 hover:text-[#3c6ca8]'
                            }`}
                        >
                            Banned Users
                        </button>
                        <button 
                            onClick={() => {
                                setShowAddAdminForm(true);
                                setActiveTab('');
                            }}
                            className={`px-4 py-2 font-medium ${
                                showAddAdminForm
                                    ? 'text-[#3c6ca8] border-b-2 border-[#3c6ca8]' 
                                    : 'text-gray-500 hover:text-[#3c6ca8]'
                            }`}
                        >
                            Add Admin
                        </button>
                    </div>
                </div>
                
                {error && (
                    <div className="mb-6 p-4 bg-red-100 text-red-800 rounded-lg border border-red-300">
                        <p className="font-medium">{error}</p>
                    </div>
                )}
                
                {actionMessage && (
                    <div className={`mb-6 p-4 rounded-lg border ${
                        actionStatus === 'success' 
                            ? 'bg-green-100 text-green-800 border-green-300' 
                            : 'bg-red-100 text-red-800 border-red-300'
                    }`}>
                        <p className="font-medium">{actionMessage}</p>
                        <button 
                            onClick={() => setActionMessage('')}
                            className="ml-2 text-sm underline hover:no-underline"
                        >
                            Dismiss
                        </button>
                    </div>
                )}
                
                {showAddAdminForm ? (
                    <div className="mb-6">
                        <AddAdminForm 
                            onSuccess={handleAddAdminSuccess}
                            onCancel={() => {
                                setShowAddAdminForm(false);
                                setActiveTab('users');
                            }}
                        />
                    </div>
                ) : (
                    <>
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#3c6ca8]"></div>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'users' && (
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
                                                                                    onClick={() => handleUnbanUser(user.id)}
                                                                                    className="text-indigo-600 hover:text-indigo-900 mr-3"
                                                                                    disabled={loading}
                                                                                >
                                                                                    Unban
                                                                                </button>
                                                                            ) : (
                                                                                <button 
                                                                                    onClick={() => handleBanClick(user)}
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
                                )}
                                
                                {activeTab === 'banned' && (
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
                                                                    onClick={() => handleUnbanUser(user.userId)}
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
                                )}
                            </>
                        )}
                    </>
                )}
            </div>
            
            <BanDialogueBox 
                isOpen={showBanModal}
                onClose={() => setShowBanModal(false)}
                onBan={handleBanUser}
                selectedUser={selectedUser}
                loading={loading}
            />
        </div>
    );
}