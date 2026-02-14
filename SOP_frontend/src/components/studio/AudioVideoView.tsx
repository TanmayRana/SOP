import React from 'react';
import { Mic, Video, Timer, MessageSquare } from 'lucide-react';

interface Scene {
    visual_description: string;
    audio_script: string;
    duration_seconds: number;
}

interface AudioVideoData {
    title: string;
    script?: string;
    speaker_notes?: string;
    scenes?: Scene[];
}

interface AudioVideoViewProps {
    data: AudioVideoData;
    type: 'audio' | 'video';
}

const AudioVideoView: React.FC<AudioVideoViewProps> = ({ data, type }) => {
    if (!data) return null;

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    {type === 'audio' ? <Mic className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </div>
                <div>
                    <h3 className="text-lg font-bold text-foreground">{data.title}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">
                        {type === 'audio' ? 'Podcast Script' : 'Video Storyboard'}
                    </p>
                </div>
            </div>

            {type === 'audio' && data.script && (
                <div className="space-y-6">
                    <div className="bg-secondary/20 p-6 rounded-2xl border border-border shadow-inner">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-primary mb-4">Narrator Script</h4>
                        <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-serif italic">
                            "{data.script}"
                        </div>
                    </div>
                    {data.speaker_notes && (
                        <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                            <MessageSquare className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div>
                                <span className="text-[10px] font-bold uppercase text-primary block mb-1">Speaker Notes</span>
                                <p className="text-xs text-muted-foreground">{data.speaker_notes}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {type === 'video' && data.scenes && (
                <div className="space-y-4">
                    {data.scenes.map((scene, i) => (
                        <div key={i} className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 group hover:border-primary/30 transition-colors">
                            <div className="md:w-1/3 space-y-2">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                                        {i + 1}
                                    </span>
                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground font-bold">
                                        <Timer className="w-3 h-3" /> {scene.duration_seconds}s
                                    </span>
                                </div>
                                <div className="aspect-video bg-background rounded-lg border border-border flex items-center justify-center p-3 text-center">
                                    <p className="text-[10px] text-muted-foreground italic leading-snug">
                                        {scene.visual_description}
                                    </p>
                                </div>
                            </div>
                            <div className="flex-1 space-y-2">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Narration</span>
                                <p className="text-sm text-foreground leading-relaxed">
                                    {scene.audio_script}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AudioVideoView;
