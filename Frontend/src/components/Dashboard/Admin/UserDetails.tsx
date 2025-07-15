import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { User, Phone, GraduationCap, Search, Users } from 'lucide-react';
import API, { UserListItem } from '@/services/api';

const UserDetails: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'unpaid'>('all');
    const [usersData, setUsersData] = useState<UserListItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                const users = await API.getAllUserDetails();
                setUsersData(users);
            } catch (err) {
                setUsersData([]);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    // Filter users based on search term and status filter
    const filteredUsers = usersData.filter((user: UserListItem) => {
        const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.college_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus =
            filterStatus === 'all' ||
            (filterStatus === 'paid' && user.is_paid) ||
            (filterStatus === 'unpaid' && !user.is_paid);
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <Users className="h-8 w-8 text-pinco-navy" />
                <h1 className="text-2xl font-bold text-white">User Details</h1>
            </div>

            {/* Search and Filter Controls */}
            <Card className="border border-pinco-gray">
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pinco-gray" />
                            <Input
                                placeholder="Search by username, email, or college..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterStatus === 'all' ? 'default' : 'outline'}
                                onClick={() => setFilterStatus('all')}
                                className="text-sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={filterStatus === 'paid' ? 'default' : 'outline'}
                                onClick={() => setFilterStatus('paid')}
                                className="text-sm"
                            >
                                Paid
                            </Button>
                            <Button
                                variant={filterStatus === 'unpaid' ? 'default' : 'outline'}
                                onClick={() => setFilterStatus('unpaid')}
                                className="text-sm"
                            >
                                Unpaid
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Users Table */}
            <Card className="border border-pinco-gray">
                <CardHeader>
                    <CardTitle className="text-pinco-navy">
                        Users ({filteredUsers.length} of {usersData.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8 text-pinco-gray">Loading...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-pinco-navy">User</TableHead>
                                        <TableHead className="text-pinco-navy">Contact</TableHead>
                                        <TableHead className="text-pinco-navy">College</TableHead>
                                        <TableHead className="text-pinco-navy">Branch</TableHead>
                                        <TableHead className="text-pinco-navy">Subscription</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredUsers.map((user: UserListItem, idx: number) => (
                                        <TableRow key={user.email + idx} className="hover:bg-pinco-lightblue/5">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-pinco-lightblue rounded-full flex items-center justify-center">
                                                        <User className="h-5 w-5 text-pinco-navy" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-pinco-navy">{user.username}</p>
                                                        <p className="text-sm text-pinco-gray">{user.email}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="whitespace-nowrap">
                                                <span className="text-sm">{user.phone || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-pinco-gray" />
                                                    <span className="text-sm">{user.college_name || '-'}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">{user.branch_name || '-'}</span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <Badge
                                                        variant={user.is_paid ? "default" : "destructive"}
                                                        className={user.is_paid
                                                            ? "bg-green-100 text-green-800 hover:bg-green-100"
                                                            : "bg-red-100 text-red-800 hover:bg-red-100"
                                                        }
                                                    >
                                                        {user.is_paid ? "Paid" : "Unpaid"}
                                                    </Badge>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border border-pinco-gray">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-pinco-navy">{usersData.length}</p>
                        <p className="text-sm text-pinco-gray">Total Users</p>
                    </CardContent>
                </Card>
                <Card className="border border-pinco-gray">
                    <CardContent className="p-4 text-center">
                        <p className="text-2xl font-bold text-green-600">
                            {usersData.filter((u: UserListItem) => u.is_paid).length}
                        </p>
                        <p className="text-sm text-pinco-gray">Paid Users</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default UserDetails; 





