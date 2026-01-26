import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import { 
  Heart, Image as ImageIcon, Send, Loader, 
  MessageCircle, Share2, Award, MoreHorizontal, Leaf 
} from 'lucide-react'; 
import { getPosts, createPost, likePost } from '../services/communityService'; 
import { toast } from 'react-toastify';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `http://localhost:3000${path.replace(/\\/g, "/")}`;
};

const CommunityPage = () => {
  const location = useLocation(); 
  
  const [posts, setPosts] = useState([]);
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const currentUserId = userInfo._id || userInfo.id; 

  useEffect(() => {
    fetchPosts();
    if (location.state) {
      const { importedFile, importedCaption } = location.state;
      if (importedFile) {
        setImage(importedFile);
        setPreview(URL.createObjectURL(importedFile));
        setIsAutoFilled(true);
      }
      if (importedCaption) setCaption(importedCaption);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchPosts = async () => {
    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching feed:", error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setIsAutoFilled(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caption.trim()) return toast.warning("Please write something!");
    
    setLoading(true);
    const formData = new FormData();
    if (image) formData.append('image', image);
    formData.append('caption', caption);
    if (isAutoFilled) formData.append('tags', 'verified_scan');

    try {
      await createPost(formData);
      setCaption('');
      setImage(null);
      setPreview(null);
      setIsAutoFilled(false);
      toast.success("Post shared successfully!");
      fetchPosts(); 
    } catch (error) {
      console.error(error);
      toast.error("Failed to post. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (postId) => {
    const postIndex = posts.findIndex(p => p._id === postId);
    if (postIndex === -1) return;

    const post = posts[postIndex];
    const isLiked = post.likes.includes(currentUserId);

    const optimizedPosts = [...posts];
    if (isLiked) {
        optimizedPosts[postIndex] = { ...post, likes: post.likes.filter(id => id !== currentUserId) };
    } else {
        optimizedPosts[postIndex] = { ...post, likes: [...post.likes, currentUserId] };
    }
    setPosts(optimizedPosts);

    try {
      await likePost(postId);
    } catch (error) {
      console.error("Like failed", error);
      setPosts(posts); 
    }
  };

  return (
    // --- NEW BACKGROUND: Warm Earthy Tones ---
    // Changed from cool teal/gray to Warm Amber/Stone/Emerald
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-amber-50 via-stone-50 to-emerald-50 pt-6 pb-12">
      
      {/* --- NEW ANIMATED BLOBS: Nature Colors --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
          {/* Top Right: Sun/Warmth */}
          <div className="absolute -top-[10%] -right-[10%] w-[600px] h-[600px] bg-orange-200/30 rounded-full blur-[120px] mix-blend-multiply animate-blob"></div>
          
          {/* Bottom Left: Nature/Leaves */}
          <div className="absolute top-[30%] -left-[10%] w-[500px] h-[500px] bg-emerald-200/30 rounded-full blur-[100px] mix-blend-multiply animate-blob animation-delay-2000"></div>
          
          {/* Center: Freshness/Light */}
          <div className="absolute bottom-[0%] right-[20%] w-[400px] h-[400px] bg-yellow-100/50 rounded-full blur-[90px] mix-blend-multiply animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-2xl mx-auto px-4 space-y-6 relative z-10">
          
          {/* Create Post Widget */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-stone-100 p-5 transition-all hover:shadow-xl hover:bg-white/90">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0 ring-2 ring-white">
                {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <form onSubmit={handleSubmit} className="flex-1">
                <textarea
                  className="w-full p-3 bg-stone-50/50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500/50 transition resize-none text-stone-700 min-h-[80px] border border-stone-100 placeholder-stone-400"
                  placeholder="Share your eco-wins! What did you recycle today?"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                />
                
                {preview && (
                  <div className="mt-3 relative rounded-xl overflow-hidden group shadow-md">
                    <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition" />
                    <button 
                      type="button" 
                      onClick={() => {setImage(null); setPreview(null);}}
                      className="absolute top-2 right-2 bg-white/90 text-stone-700 rounded-full p-1.5 hover:bg-red-100 hover:text-red-600 transition shadow-lg"
                    >✕</button>
                    {isAutoFilled && (
                        <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 shadow-sm font-bold tracking-wide">
                            <Award className="w-3 h-3" /> VERIFIED SCAN
                        </span>
                    )}
                  </div>
                )}

                <div className="flex justify-between items-center mt-4">
                  <label className="cursor-pointer flex items-center gap-2 text-stone-600 hover:text-emerald-700 transition px-3 py-1.5 rounded-lg hover:bg-emerald-50/80 font-medium">
                    <ImageIcon className="w-5 h-5" />
                    <span className="text-sm">Add Photo</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                  </label>
                  
                  <button 
                    type="submit" 
                    disabled={loading || (!caption && !image)}
                    className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-6 py-2.5 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:translate-y-0"
                  >
                    {loading ? <Loader className="animate-spin w-4 h-4" /> : <><Send className="w-4 h-4" /> Post</>}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Posts Feed */}
          {posts.map((post) => {
            const userName = post.user?.name || 'Unknown User';
            const nameLength = userName.length;
            // Updated gradients for avatars to match Earthy theme
            const avatarGradient = nameLength % 2 === 0 
                ? 'from-amber-400 to-orange-500' 
                : 'from-emerald-400 to-teal-500';

            return (
              <div key={post._id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-stone-100 overflow-hidden hover:shadow-xl hover:translate-y-[-2px] transition-all duration-300">
                {/* Post Header */}
                <div className="p-4 flex justify-between items-start border-b border-stone-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full p-[2px] bg-gradient-to-tr from-stone-200 to-stone-300">
                      <div className={`w-full h-full rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br ${avatarGradient} border-2 border-white`}>
                           {userName.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-800 text-sm flex items-center gap-1">
                          {userName}
                          <Award className="w-3 h-3 text-amber-500 fill-current drop-shadow-sm" />
                      </h3>
                      <p className="text-xs text-stone-400 font-medium">
                        {new Date(post.createdAt).toLocaleDateString()} • {new Date(post.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                  <button className="text-stone-400 hover:bg-stone-100 p-2 rounded-full transition"><MoreHorizontal className="w-5 h-5" /></button>
                </div>

                {/* Post Content */}
                <div className="px-5 py-3">
                   <p className="text-stone-700 leading-relaxed text-[15px]">{post.caption}</p>
                </div>

                {/* Post Image */}
                {post.image && (
                    <div className="bg-stone-50">
                      <img 
                          src={getImageUrl(post.image)} 
                          alt="Post content" 
                          className="w-full max-h-[500px] object-contain mix-blend-normal"
                          loading="lazy"
                          onError={(e) => {e.target.style.display='none'}} 
                      />
                    </div>
                )}

                {/* Post Actions */}
                <div className="p-3 px-5 border-t border-stone-100 bg-stone-50/30">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6">
                          <button 
                              onClick={() => handleLike(post._id)}
                              className="flex items-center gap-2 group focus:outline-none"
                          >
                              <div className={`p-2 rounded-full transition-all duration-300 ${post.likes.includes(currentUserId) ? 'bg-red-50 ring-4 ring-red-50' : 'group-hover:bg-stone-100'}`}>
                                  <Heart 
                                      className={`w-5 h-5 transition-transform duration-300 ${post.likes.includes(currentUserId) ? 'fill-red-500 text-red-500 scale-110' : 'text-stone-500 group-hover:scale-110'}`} 
                                  />
                              </div>
                              <span className={`text-sm font-bold ${post.likes.includes(currentUserId) ? 'text-red-500' : 'text-stone-500'}`}>
                                  {post.likes.length || 'Like'}
                              </span>
                          </button>

                          <button className="flex items-center gap-2 group text-stone-500 hover:text-emerald-600 transition">
                               <div className="p-2 rounded-full group-hover:bg-emerald-50 transition">
                                  <MessageCircle className="w-5 h-5" />
                               </div>
                               <span className="text-sm font-bold">Comment</span>
                          </button>
                      </div>

                      <button className="text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 p-2 rounded-full transition">
                          <Share2 className="w-5 h-5" />
                      </button>
                  </div>
                </div>
              </div>
            );
          })}

          {posts.length === 0 && (
            <div className="text-center py-20 bg-white/60 backdrop-blur-sm rounded-2xl shadow-sm border border-white/50">
              <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Leaf className="w-10 h-10 text-emerald-600" />
              </div>
              <p className="text-xl font-bold text-stone-700">No posts yet</p>
              <p className="text-stone-500 mt-2">The community is quiet... be the first to speak up!</p>
            </div>
          )}
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default CommunityPage;