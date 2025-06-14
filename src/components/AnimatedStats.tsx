
import React from 'react';
import CountUpAnimation from './CountUpAnimation';

const AnimatedStats = () => {
  const stats = [
    {
      number: 500,
      suffix: '+',
      label: 'عميل راضٍ',
      color: 'text-purple-600'
    },
    {
      number: 99,
      suffix: '%',
      label: 'رضا العملاء',
      color: 'text-indigo-600'
    },
    {
      number: 24,
      suffix: '/7',
      label: 'خدمة مستمرة',
      color: 'text-rose-600'
    }
  ];

  return (
    <>
      {stats.map((stat, index) => (
        <div
          key={index}
          className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 animate-fade-in"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          <div className={`text-3xl font-bold ${stat.color} mb-2`}>
            <CountUpAnimation
              end={stat.number}
              duration={2000}
              suffix={stat.suffix}
            />
          </div>
          <div className="text-gray-600 font-medium">{stat.label}</div>
        </div>
      ))}
    </>
  );
};

export default AnimatedStats;
