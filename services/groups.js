/**
 * Groups Service (Google Groups Alternative)
 */
class GroupsService {
  constructor() {
    this.groups = new Map();
    this.discussions = new Map();
  }

  async createGroup({ name, description, ownerId, privacy = 'public' }) {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const group = {
      id: groupId,
      name,
      description,
      ownerId,
      privacy,
      members: [ownerId],
      email: `${name.toLowerCase().replace(/\s+/g, '-')}@groups.elevate.edu`,
      createdAt: new Date()
    };
    this.groups.set(groupId, group);
    return group;
  }

  async addMember(groupId, userId) {
    const group = this.groups.get(groupId);
    if (!group) throw new Error('Group not found');
    if (!group.members.includes(userId)) {
      group.members.push(userId);
    }
    return group;
  }

  async createDiscussion(groupId, topic, content, authorId) {
    const discussionId = `disc_${Date.now()}`;
    const discussion = {
      id: discussionId,
      groupId,
      topic,
      content,
      authorId,
      replies: [],
      createdAt: new Date()
    };
    this.discussions.set(discussionId, discussion);
    return discussion;
  }

  async sendToGroup(groupId, message) {
    const group = this.groups.get(groupId);
    if (!group) throw new Error('Group not found');
    console.log(`Sending to ${group.members.length} members:`, message);
    return { sent: group.members.length };
  }
}
module.exports = new GroupsService();
