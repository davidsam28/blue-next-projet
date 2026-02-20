'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PostsManager } from './PostsManager'
import { ClassesManager } from './ClassesManager'
import { ResourcesManager } from './ResourcesManager'
import { EventsManager } from './EventsManager'
import { FileText, GraduationCap, BookOpen, Calendar } from 'lucide-react'
import type { LrcPost, LrcClass, LrcResource, LrcEvent } from '@/types/database'

interface LrcAdminProps {
  initialPosts: LrcPost[]
  initialClasses: LrcClass[]
  initialResources: LrcResource[]
  initialEvents: LrcEvent[]
}

export function LrcAdmin({ initialPosts, initialClasses, initialResources, initialEvents }: LrcAdminProps) {
  return (
    <Tabs defaultValue="posts" className="w-full">
      <TabsList className="w-full grid grid-cols-4 mb-6">
        <TabsTrigger value="posts" className="gap-1.5 text-xs sm:text-sm">
          <FileText className="h-4 w-4 hidden sm:block" />
          Posts
          <span className="text-[10px] text-gray-400">({initialPosts.length})</span>
        </TabsTrigger>
        <TabsTrigger value="classes" className="gap-1.5 text-xs sm:text-sm">
          <GraduationCap className="h-4 w-4 hidden sm:block" />
          Classes
          <span className="text-[10px] text-gray-400">({initialClasses.length})</span>
        </TabsTrigger>
        <TabsTrigger value="resources" className="gap-1.5 text-xs sm:text-sm">
          <BookOpen className="h-4 w-4 hidden sm:block" />
          Resources
          <span className="text-[10px] text-gray-400">({initialResources.length})</span>
        </TabsTrigger>
        <TabsTrigger value="events" className="gap-1.5 text-xs sm:text-sm">
          <Calendar className="h-4 w-4 hidden sm:block" />
          Events
          <span className="text-[10px] text-gray-400">({initialEvents.length})</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts">
        <PostsManager initialPosts={initialPosts} />
      </TabsContent>
      <TabsContent value="classes">
        <ClassesManager initialClasses={initialClasses} />
      </TabsContent>
      <TabsContent value="resources">
        <ResourcesManager initialResources={initialResources} />
      </TabsContent>
      <TabsContent value="events">
        <EventsManager initialEvents={initialEvents} />
      </TabsContent>
    </Tabs>
  )
}
