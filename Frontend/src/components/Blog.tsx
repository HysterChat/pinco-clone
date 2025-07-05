import React from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Footer from './Footer';

interface BlogPost {
    title: string;
    excerpt: string;
    author: string;
    date: string;
    readTime: string;
    category: string;
    image: string;
}

const blogPosts: BlogPost[] = [
    {
        title: "10 Common Interview Questions and How to Answer Them",
        excerpt: "Learn how to ace the most frequently asked interview questions with confidence and authenticity.",
        author: "Sarah Wilson",
        date: "June 1, 2023",
        readTime: "5 min read",
        category: "Interview Tips",
        image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
        title: "How to Handle Technical Interviews",
        excerpt: "A comprehensive guide to acing technical interviews with practical tips and strategies.",
        author: "Michael Peterson",
        date: "May 28, 2023",
        readTime: "8 min read",
        category: "Technical Interviews",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1472&q=80"
    },
    {
        title: "The Power of AI in Interview Preparation",
        excerpt: "Discover how artificial intelligence is transforming the way job seekers prepare for interviews.",
        author: "Emily Chen",
        date: "May 25, 2023",
        readTime: "6 min read",
        category: "AI Technology",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1632&q=80"
    },
    {
        title: "Behavioral Interview Skills: Going Beyond the Obvious",
        excerpt: "Master the art of telling compelling stories and showcasing your experience in behavioral interviews.",
        author: "David Harris",
        date: "May 22, 2023",
        readTime: "7 min read",
        category: "Interview Skills",
        image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1469&q=80"
    },
    {
        title: "After Receiving a Job Offer: Next Steps",
        excerpt: "Learn how to confidently negotiate your compensation package and make an informed decision.",
        author: "Jennifer Lee",
        date: "May 20, 2023",
        readTime: "5 min read",
        category: "Career Advice",
        image: "https://images.unsplash.com/photo-1674027444485-cec3da58eef4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
    },
    {
        title: "Remote Interview Tips: Virtual Success",
        excerpt: "Best practices for making a strong impression in virtual interviews and common mistakes to avoid.",
        author: "Alex Cooper",
        date: "May 18, 2023",
        readTime: "6 min read",
        category: "Remote Work",
        image: "https://images.unsplash.com/photo-1603201667141-5a2d4c673378?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1496&q=80"
    }
];

const categories = [
    "All Posts",
    "Interview Tips",
    "Technical Interviews",
    "Career Advice",
    "AI Technology",
    "Remote Work",
    "Interview Skills"
];

const Blog = () => {
    return (
        <>
            <div className="min-h-screen bg-[#C5CAE9]/30">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-3xl font-bold text-[#1E1B4B] mb-3">
                            Interview Insights Blog
                        </h1>
                        <p className="text-[#1E1B4B]/70">
                            Expert articles, tips, and strategies to help you succeed in your job interviews and career.
                        </p>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8">
                        <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                            {/* Search */}
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search articles..."
                                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                />
                            </div>

                            {/* Category Filters */}
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                {categories.map((category, index) => (
                                    <Button
                                        key={index}
                                        variant={index === 0 ? "default" : "outline"}
                                        className={index === 0 ? "bg-[#4F46E5]" : "text-[#1E1B4B] hover:bg-[#4F46E5]/10"}
                                        size="sm"
                                    >
                                        {category}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Featured Post */}
                    <div className="mb-12">
                        <div className="bg-white rounded-xl overflow-hidden shadow-md">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="relative w-full pt-[75%] md:pt-0 md:h-full">
                                    <img
                                        src={blogPosts[0].image}
                                        alt={blogPosts[0].title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 flex flex-col">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-sm text-[#4F46E5]">{blogPosts[0].category}</span>
                                        <span className="text-sm text-slate-500">•</span>
                                        <span className="text-sm text-slate-500">{blogPosts[0].readTime}</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-[#1E1B4B] mb-3">
                                        {blogPosts[0].title}
                                    </h2>
                                    <p className="text-[#1E1B4B]/70 mb-4 flex-1">
                                        {blogPosts[0].excerpt}
                                    </p>
                                    <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white w-fit">
                                        Read more
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Blog Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                        {blogPosts.slice(1).map((post, index) => (
                            <div key={index} className="bg-white rounded-xl overflow-hidden shadow-md flex flex-col h-full">
                                <div className="relative w-full pt-[56.25%]">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex items-center gap-4 mb-4">
                                        <span className="text-sm text-[#4F46E5]">{post.category}</span>
                                        <span className="text-sm text-slate-500">•</span>
                                        <span className="text-sm text-slate-500">{post.readTime}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-[#1E1B4B] mb-3">
                                        {post.title}
                                    </h3>
                                    <p className="text-[#1E1B4B]/70 mb-4 flex-1">
                                        {post.excerpt}
                                    </p>
                                    <Button variant="outline" className="text-[#4F46E5] hover:bg-[#4F46E5]/10 w-fit">
                                        Read more
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Newsletter */}
                    <div className="bg-[#4F46E5]/20 rounded-xl p-8 text-center">
                        <h3 className="text-xl font-bold text-[#1E1B4B] mb-2">
                            Subscribe to Our Newsletter
                        </h3>
                        <p className="text-[#1E1B4B]/70 mb-6">
                            Get the latest interview tips, career advice, and job search insights directly sent to your inbox.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                            <Button className="bg-[#4F46E5] hover:bg-[#4338CA] text-white">
                                Subscribe
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default Blog; 