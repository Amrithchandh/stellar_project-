import { Response } from 'express';
import { prisma } from '../config/db';
import { AuthenticatedRequest } from '../middleware/auth';

// GET /api/notifications — List user notifications (paginated)
export const listNotifications = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { page = '1', limit = '20', unreadOnly } = req.query;
  const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

  try {
    const where: any = { userId: req.user.id };
    if (unreadOnly === 'true') where.isRead = false;

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit as string) }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId: req.user.id, isRead: false } })
    ]);

    return res.json({ notifications, unreadCount, pagination: { total, page: parseInt(page as string), totalPages: Math.ceil(total / parseInt(limit as string)) } });
  } catch (error) {
    console.error('[Notifications]: List failed:', error);
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
};

// PATCH /api/notifications/:id/read — Mark a notification as read
export const markAsRead = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { id } = req.params;

  try {
    const notification = await prisma.notification.findFirst({ where: { id, userId: req.user.id } });
    if (!notification) return res.status(404).json({ error: 'Notification not found' });

    const updated = await prisma.notification.update({ where: { id }, data: { isRead: true } });
    return res.json({ message: 'Notification marked as read', notification: updated });
  } catch (error) {
    console.error('[Notifications]: Mark read failed:', error);
    return res.status(500).json({ error: 'Failed to update notification' });
  }
};

// PATCH /api/notifications/mark-all-read — Mark all notifications as read
export const markAllRead = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

  try {
    await prisma.notification.updateMany({ where: { userId: req.user.id, isRead: false }, data: { isRead: true } });
    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('[Notifications]: Mark all read failed:', error);
    return res.status(500).json({ error: 'Failed to mark all notifications as read' });
  }
};

// POST /api/admin/notifications/broadcast — Admin broadcast (ADMIN only)
export const broadcastNotification = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
  const { title, body, type, targetRole } = req.body;

  if (!title || !body) return res.status(400).json({ error: 'Title and body required' });

  try {
    const users = targetRole
      ? await prisma.user.findMany({ where: { role: targetRole }, select: { id: true } })
      : await prisma.user.findMany({ select: { id: true } });

    await prisma.notification.createMany({
      data: users.map(u => ({ userId: u.id, title, body, type: type || 'INFO' }))
    });

    return res.json({ message: `Notification broadcast to ${users.length} users` });
  } catch (error) {
    console.error('[Notifications]: Broadcast failed:', error);
    return res.status(500).json({ error: 'Failed to broadcast notification' });
  }
};
