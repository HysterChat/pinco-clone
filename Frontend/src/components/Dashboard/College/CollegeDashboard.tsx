import React, { useState, useMemo } from 'react';
import { Card } from "../../ui/card";
import { Input } from "../../ui/input";
import { Button } from "../../ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { Search, Filter, Download } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../ui/table";

interface Student {
    id: number;
    name: string;
    email: string;
    rollNo: string;
    department: string;
    branch: string;
    paymentStatus: 'paid' | 'unpaid';
}

// Mock data - replace with actual data from your backend
const collegeData = {
    name: "Indian Institute of Technology, Madras",
    location: "Chennai, Tamil Nadu",
    established: "1959",
    students: {
        total: 1200,
        enrolled: 980,
        paid: 850,
        unpaid: 130
    }
};

// Mock student data
const mockStudents: Student[] = [
    {
        id: 1,
        name: "Rahul Kumar",
        email: "rahul.k@iitm.ac.in",
        rollNo: "CS21B001",
        department: "Computer Science",
        branch: "B.Tech",
        paymentStatus: "paid"
    },
    {
        id: 2,
        name: "Priya Sharma",
        email: "priya.s@iitm.ac.in",
        rollNo: "EE21M002",
        department: "Electrical Engineering",
        branch: "M.Tech",
        paymentStatus: "unpaid"
    },
    {
        id: 3,
        name: "Arun Verma",
        email: "arun.v@iitm.ac.in",
        rollNo: "ME21B003",
        department: "Mechanical Engineering",
        branch: "B.Tech",
        paymentStatus: "paid"
    },
    {
        id: 4,
        name: "Sneha Patel",
        email: "sneha.p@iitm.ac.in",
        rollNo: "CH21D004",
        department: "Chemical Engineering",
        branch: "Ph.D",
        paymentStatus: "paid"
    },
    {
        id: 5,
        name: "Mohammed Ali",
        email: "mohammed.a@iitm.ac.in",
        rollNo: "CS21B005",
        department: "Computer Science",
        branch: "B.Tech",
        paymentStatus: "unpaid"
    }
];

const CollegeDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [branchFilter, setBranchFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all');

    // Get unique departments and branches for filter options
    const departments = [...new Set(mockStudents.map(student => student.department))];
    const branches = [...new Set(mockStudents.map(student => student.branch))];

    // Function to download student data as Excel
    const downloadExcel = () => {
        try {
            import('xlsx').then(XLSX => {
                // Convert the filtered students data to worksheet format
                const worksheet = XLSX.utils.json_to_sheet(filteredStudents.map(student => ({
                    'Roll No': student.rollNo,
                    'Name': student.name,
                    'Email': student.email,
                    'Department': student.department,
                    'Branch': student.branch,
                    'Payment Status': student.paymentStatus.toUpperCase()
                })));

                // Create a workbook and append the worksheet
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Students');

                // Generate and download the Excel file
                XLSX.writeFile(workbook, 'student_details.xlsx');
            });
        } catch (error) {
            console.error('Error downloading Excel:', error);
        }
    };

    // Filter students based on search and filter criteria
    const filteredStudents = useMemo(() => {
        return mockStudents.filter(student => {
            const matchesSearch = searchTerm === '' ||
                student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.rollNo.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesDepartment = departmentFilter === 'all' || student.department === departmentFilter;
            const matchesBranch = branchFilter === 'all' || student.branch === branchFilter;
            const matchesPayment = paymentFilter === 'all' || student.paymentStatus === paymentFilter;

            return matchesSearch && matchesDepartment && matchesBranch && matchesPayment;
        });
    }, [searchTerm, departmentFilter, branchFilter, paymentFilter]);

    return (
        <div className="w-full space-y-4 p-2 sm:p-4 md:p-6">
            {/* College Information Card */}
            <Card className="p-4 md:p-6 bg-white shadow-lg">
                <div className="space-y-2 md:space-y-4">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 break-words">{collegeData.name}</h1>
                    <div className="flex flex-wrap items-center text-sm sm:text-base text-gray-600 gap-2 sm:gap-4">
                        <span className="break-words">{collegeData.location}</span>
                        <span className="hidden sm:inline">•</span>
                        <span>Est. {collegeData.established}</span>
                    </div>
                </div>
            </Card>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
                {/* Total Students */}
                <Card className="p-3 sm:p-4 md:p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-sm sm:text-base font-medium text-gray-600">Total Students</h3>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-[#4169E1]">{collegeData.students.total}</p>
                    </div>
                </Card>

                {/* Enrolled Students */}
                <Card className="p-3 sm:p-4 md:p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-sm sm:text-base font-medium text-gray-600">Enrolled</h3>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-[#22C55E]">{collegeData.students.enrolled}</p>
                    </div>
                </Card>

                {/* Paid Users */}
                <Card className="p-3 sm:p-4 md:p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-sm sm:text-base font-medium text-gray-600">Paid Users</h3>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-[#22C55E]">{collegeData.students.paid}</p>
                    </div>
                </Card>

                {/* Unpaid Users */}
                <Card className="p-3 sm:p-4 md:p-6 bg-white shadow-md hover:shadow-lg transition-shadow">
                    <div className="space-y-1 sm:space-y-2">
                        <h3 className="text-sm sm:text-base font-medium text-gray-600">Unpaid Users</h3>
                        <p className="text-lg sm:text-2xl md:text-3xl font-bold text-[#EF4444]">{collegeData.students.unpaid}</p>
                    </div>
                </Card>
            </div>

            {/* Search and Filters */}
            <Card className="p-4 md:p-6 bg-white">
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                        <Input
                            placeholder="Search by name, email, or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border-gray-200 focus:border-blue-500 focus:ring-blue-500 bg-transparent rounded-md"
                        />
                    </div>

                    {/* Filters Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-500" />
                                <span className="text-sm text-gray-500">Filters:</span>
                            </div>
                            <Button
                                onClick={downloadExcel}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Download className="h-4 w-4" />
                                <span>Download Excel</span>
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {/* Department Filter */}
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="w-full bg-transparent border-gray-200 h-10">
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Branch Filter */}
                            <Select value={branchFilter} onValueChange={setBranchFilter}>
                                <SelectTrigger className="w-full bg-transparent border-gray-200 h-10">
                                    <SelectValue placeholder="All Branches" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Branches</SelectItem>
                                    {branches.map(branch => (
                                        <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {/* Payment Status Filter */}
                            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                                <SelectTrigger className="w-full bg-transparent border-gray-200 h-10">
                                    <SelectValue placeholder="All Payment Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Payment Status</SelectItem>
                                    <SelectItem value="paid">Paid</SelectItem>
                                    <SelectItem value="unpaid">Unpaid</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="text-xs sm:text-sm text-gray-500">
                        Showing {filteredStudents.length} of {mockStudents.length} students
                    </div>
                </div>
            </Card>

            {/* Students Table */}
            <Card className="bg-white overflow-hidden">
                <div className="w-full overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gray-50">
                                <TableHead className="font-medium text-gray-500 whitespace-nowrap">Roll No</TableHead>
                                <TableHead className="font-medium text-gray-500 whitespace-nowrap">Name</TableHead>
                                <TableHead className="font-medium text-gray-500 whitespace-nowrap">Email</TableHead>
                                <TableHead className="font-medium text-gray-500 whitespace-nowrap">Department</TableHead>
                                <TableHead className="font-medium text-gray-500 whitespace-nowrap">Branch</TableHead>
                                <TableHead className="font-medium text-gray-500 whitespace-nowrap">Payment Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 text-sm">
                                        No students found matching the current filters
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium whitespace-nowrap">{student.rollNo}</TableCell>
                                        <TableCell className="whitespace-nowrap">{student.name}</TableCell>
                                        <TableCell className="whitespace-nowrap">{student.email}</TableCell>
                                        <TableCell className="whitespace-nowrap">{student.department}</TableCell>
                                        <TableCell className="whitespace-nowrap">{student.branch}</TableCell>
                                        <TableCell className="whitespace-nowrap">
                                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${student.paymentStatus === 'paid'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'
                                                }`}>
                                                {student.paymentStatus.toUpperCase()}
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>
        </div>
    );
};

export default CollegeDashboard; 