import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, Camera, MapPin, Leaf, Recycle, Users, 
  Scan, CheckCircle2, ArrowRightCircle, MessageCircle, Heart
} from 'lucide-react';

const HomePage = () => {
  // --- State for Hero Section ---
  const [impactCount, setImpactCount] = useState(12450);

  // Simulate live counter increasing
  useEffect(() => {
    const interval = setInterval(() => {
      setImpactCount(prev => prev + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);


  // --- State & Logic for Community Feed Simulation ---
  const [feedItems, setFeedItems] = useState([
    { user: "Alex M.", action: "recycled 5 plastic bottles", location: "Downtown", time: "2m ago" },
    { user: "Sarah K.", action: "mapped a new e-waste bin", location: "Westside", time: "5m ago" },
    { user: "Mike R.", action: "earned 'Glass Guru' badge", location: null, time: "12m ago" },
  ]);
  const feedScrollRef = useRef(null);

  // Simulate new feed items arriving
  useEffect(() => {
    const possibleActions = [
      { action: "scanned aluminum cans", location: "Northwood" },
      { action: "visited a drop-off center", location: "City Park" },
      { action: "joined the 'Plastic Free July' challenge", location: null },
    ];
    const users = ["Chris P.", "Taylor S.", "Jordan B.", "Casey L."];

    const interval = setInterval(() => {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomAct = possibleActions[Math.floor(Math.random() * possibleActions.length)];
      
      const newItem = {
        user: randomUser,
        action: randomAct.action,
        location: randomAct.location,
        time: "Just now"
      };

      setFeedItems(prev => [newItem, ...prev.slice(0, 4)]); // Add new to top, keep keep recent 5
      
      // Reset scroll to top to show new item smoothly
      if (feedScrollRef.current) {
         feedScrollRef.current.scrollTop = 0;
      }

    }, 5000); // New item every 5 seconds

    return () => clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      
      {/* ================= HERO SECTION (Kept from previous version) ================= */}
      <section className="relative bg-gradient-to-br from-green-600 to-teal-800 text-white pt-24 pb-36 overflow-hidden">
        {/* ... (Background blobs retained for visual consistency) ... */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-400 opacity-10 rounded-full translate-x-1/3 translate-y-1/3 blur-3xl"></div>

        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-12 z-10 relative">
          {/* Text Content */}
          <div className="md:w-1/2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-500 bg-opacity-30 rounded-full text-sm font-semibold mb-6 border border-green-400 backdrop-blur-sm">
              <Recycle className="w-4 h-4 animate-spin-slow" /> AI-Powered Recycling Assistant
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-heading mb-6 leading-tight">
              Waste less. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-200 to-lime-300">
                Live more.
              </span>
            </h1>
            <p className="text-xl mb-8 text-green-50 max-w-lg mx-auto md:mx-0 opacity-90">
              Instantly identify waste, find local solutions, and join a community making a real difference.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Link to="/identify" className="group bg-white text-green-700 px-8 py-4 rounded-full font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2">
                Scan Now <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Animated Scanner Visual */}
          <div className="md:w-1/2 flex justify-center">
             <div className="relative w-64 h-80 bg-gray-900 rounded-[2rem] border-4 border-gray-800 shadow-2xl overflow-hidden tilt-in-fwd-tr">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605600659908-0ef719419d41?q=80&w=400&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
                 <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent"></div>
                 {/* Scanning animation */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_20px_#4ade80] animate-scan-down"></div>
                 
                 <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 flex items-center gap-3 animate-fade-in-up">
                    <div className="bg-green-500 p-2 rounded-full"><CheckCircle2 className="w-5 h-5 text-white"/></div>
                    <div>
                        <p className="text-white font-bold text-sm">It's Recyclable!</p>
                        <p className="text-green-200 text-xs">Plastic #1 (PET)</p>
                    </div>
                 </div>
             </div>
          </div>
        </div>
      </section>

      {/* ================= STATS BAR (Floating) ================= */}
      <div className="container mx-auto px-4 -mt-12 relative z-20 mb-24">
        <div className="bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] p-6 grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <StatItem icon={<Leaf className="text-green-500" />} value={`${impactCount.toLocaleString()} kg`} label="CO2 Offset" />
            <StatItem icon={<Users className="text-blue-500" />} value="12.5k" label="Active Members" />
            <StatItem icon={<MapPin className="text-orange-500" />} value="850+" label="Drop-off Points" />
        </div>
      </div>


      {/* ================= NEW: INTERACTIVE IDENTIFY SECTION ================= */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-16">
          
          {/* Text Side */}
          <div className="md:w-1/2 order-2 md:order-1">
            <span className="text-green-600 font-bold tracking-wider uppercase text-sm">The Core Feature</span>
            <h2 className="text-4xl font-bold text-gray-800 mt-2 mb-6">See it. Scan it. Sort it.</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Unsure if that takeout container is recyclable? Our advanced AI analyzes your photo in seconds, telling you exactly what material it is and which bin it goes into locally.
            </p>
            <Link to="/identify" className="inline-flex items-center gap-2 text-green-600 font-bold hover:text-green-700 hover:underline text-lg transition group">
              Try the Scanner <ArrowRightCircle className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Interactive Visual Side (Process Flow) */}
          <div className="md:w-1/2 order-1 md:order-2">
            <div className="bg-gradient-to-br from-green-50 to-blue-50 p-8 rounded-3xl border border-green-100 relative overflow-hidden group/flow cursor-default">
              {/* Decorative background line */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-green-200 -translate-y-1/2 z-0"></div>
              <div className="absolute top-1/2 left-0 w-0 h-1 bg-green-500 -translate-y-1/2 z-0 group-hover/flow:w-full transition-all duration-1000 ease-in-out"></div>

              <div className="relative z-10 flex justify-between">
                {/* Step 1 */}
                <ProcessStep icon={<Camera />} title="1. Snap" desc="Take a quick photo." />
                {/* Step 2 */}
                <ProcessStep icon={<Scan />} title="2. Analyze" desc="AI identifies material." delay="delay-300" />
                {/* Step 3 */}
                <ProcessStep icon={<Recycle />} title="3. Sort" desc="Get the correct bin." delay="delay-500" />
              </div>
            </div>
             <p className="text-center text-sm text-gray-400 mt-4">Hover over the steps to see the flow</p>
          </div>
        </div>
      </section>


      {/* ================= NEW: INTERACTIVE COMMUNITY SECTION ================= */}
      <section className="py-20 bg-white relative overflow-hidden">
         {/* Decorative side elements */}
         <Recycle className="absolute -left-10 top-20 w-32 h-32 text-green-50 rotate-45" />
         <Users className="absolute -right-10 bottom-20 w-32 h-32 text-blue-50 -rotate-12" />

        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16 relative z-10">
           {/* Visual Side (Live Feed Simulation) */}
          <div className="md:w-1/2 w-full">
            <div className="bg-gray-50 rounded-3xl p-6 border border-gray-200 shadow-inner max-h-[400px] overflow-hidden relative">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Live Community Activity</h3>
                    <Users className="text-gray-400 w-5 h-5"/>
                </div>
                
                {/* Animated Feed List */}
                <div ref={feedScrollRef} className="space-y-3 overflow-y-auto max-h-[300px] scroll-smooth pr-2 mask-image-b">
                  {feedItems.map((item, index) => (
                    <div key={index} className={`bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-3 animate-slide-in-right`} style={{animationDelay: `${index * 100}ms`}}>
                        <div className="bg-gradient-to-tr from-blue-400 to-green-400 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0">
                            {item.user.charAt(0)}
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm text-gray-800">
                                <span className="font-bold">{item.user}</span> {item.action}.
                            </p>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                                <span>{item.time}</span>
                                {item.location && (
                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3"/> {item.location}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 text-gray-300">
                           <Heart className="w-4 h-4 hover:text-red-400 hover:fill-current cursor-pointer transition"/>
                        </div>
                    </div>
                  ))}
                </div>
                 {/* Fade effect at bottom of feed */}
                <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-gray-50 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Text Side */}
          <div className="md:w-1/2">
            <span className="text-blue-600 font-bold tracking-wider uppercase text-sm">Join the Movement</span>
            <h2 className="text-4xl font-bold text-gray-800 mt-2 mb-6">Your Local Efforts, Collective Impact.</h2>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              See what your neighbors are recycling, find crowdsourced drop-off locations, and compete on the city leaderboard. Recycling is better together.
            </p>
            <div className="flex gap-4">
                <Link to="/community" className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold hover:bg-blue-700 transition shadow-md hover:shadow-lg flex items-center gap-2">
                Explore Community <Users className="w-5 h-5" />
                </Link>
                <Link to="/map" className="bg-white text-gray-700 border-2 border-gray-200 px-6 py-3 rounded-full font-bold hover:border-blue-400 hover:text-blue-600 transition flex items-center gap-2">
                View Map <MapPin className="w-5 h-5" />
                </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global Styles for Animations */}
      <style jsx>{`
        .animate-spin-slow { animation: spin 4s linear infinite; }
        
        @keyframes scan-down {
          0% { top: 0%; opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan-down { animation: scan-down 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }

        @keyframes fade-in-up {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards 0.5s; opacity: 0; }

        @keyframes slide-in-right {
             from { opacity: 0; transform: translateX(-20px); }
             to { opacity: 1; transform: translateX(0); }
        }
        .animate-slide-in-right { animation: slide-in-right 0.4s ease-out forwards; }

        .tilt-in-fwd-tr { animation: tilt-in-fwd-tr 0.6s cubic-bezier(0.250, 0.460, 0.450, 0.940) both; }
        @keyframes tilt-in-fwd-tr {
            0% { transform: rotateY(20deg) rotateX(35deg) translate(300px, -300px) skew(-35deg, 10deg); opacity: 0; }
            100% { transform: rotateY(0) rotateX(0deg) translate(0, 0) skew(0deg, 0deg); opacity: 1; }
        }
        /* CSS Mask for soft fade at bottom of feed list */
        .mask-image-b {
             mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        }
      `}</style>
    </div>
  );
};

// ================= SUB-COMPONENTS =================

const StatItem = ({ icon, value, label }) => (
    <div className="flex items-center gap-4 py-2 md:justify-center">
        <div className="p-3 bg-gray-50 rounded-full shadow-sm">
            {React.cloneElement(icon, { size: 26 })}
        </div>
        <div>
            <div className="text-3xl font-extrabold text-gray-800 leading-none">{value}</div>
            <div className="text-sm text-gray-500 font-medium mt-1">{label}</div>
        </div>
    </div>
);

// The circular steps in the Identify Section
const ProcessStep = ({ icon, title, desc, delay = "" }) => (
  <div className={`flex flex-col items-center text-center relative z-10 group/step ${delay} transition-transform hover:-translate-y-2 duration-300`}>
    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.08)] border-4 border-white group-hover/step:border-green-400 transition-colors duration-300 mb-4">
       <div className="text-green-600 group-hover/step:scale-110 transition-transform">
         {React.cloneElement(icon, { size: 32 })}
       </div>
    </div>
    <h3 className="font-bold text-lg text-gray-800 mb-1">{title}</h3>
    <p className="text-sm text-gray-500">{desc}</p>
  </div>
);

export default HomePage;