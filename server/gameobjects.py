import numpy as np
import time
from abc import ABC, abstractmethod

from constants import *

def _clip_field(pos, mx, my):
	# if wrong quadrant, return
	if mx * pos[0] < 0 or my * pos[1] < 0:
		return
	test_pos = pos * [mx, my]
	# in side area, return
	if test_pos[0] >= WORLD_CIRCLE_RADIUS:
		return
	# in passageway area, return
	if test_pos[1] <= WORLD_PASSAGEWAY_HALF_WIDTH:
		return
	# in circle, return
	test_pos_length = np.linalg.norm(test_pos)
	if test_pos_length <= WORLD_CIRCLE_RADIUS:
		return
	# clipping must happen, see what is closest
	dist_side = WORLD_CIRCLE_RADIUS - test_pos[0]
	assert dist_side > 0
	dist_passageway = test_pos[1] - WORLD_PASSAGEWAY_HALF_WIDTH
	assert dist_passageway > 0
	dist_circle = test_pos_length - WORLD_CIRCLE_RADIUS
	assert dist_circle > 0
	min_penetration_method = np.argmin([dist_side, dist_passageway, dist_circle])
	if min_penetration_method == 0:
		pos[0] = WORLD_CIRCLE_RADIUS * mx
	elif min_penetration_method == 1:
		pos[1] = WORLD_PASSAGEWAY_HALF_WIDTH * my
	elif min_penetration_method == 2:
		pos[:] = pos * WORLD_CIRCLE_RADIUS / test_pos_length
	else:
		assert False


def _numpy_rounded(v):
	return list(map(lambda x: round(x,3), v.tolist()))


class GameObject(ABC):
	def __init__(self, id, r):
		super().__init__()
		self.id = id
		self.r = r
		self.pos = np.zeros(2)
		self.speed = np.zeros(2)

	def step(self, dt, cur_time):
		# return true if clipping occurs
		self.pos += self.speed * dt
		# clip external rectangle
		new_pos = np.clip(self.pos, [-WORLD_HALF_SIZE_X, -WORLD_HALF_SIZE_Y], [WORLD_HALF_SIZE_X, WORLD_HALF_SIZE_Y])
		# clip internal
		for my in [-1,1]:
			for mx in [-1,1]:
				_clip_field(new_pos, mx, my)
		if not np.array_equal(new_pos, self.pos):
			self.pos = new_pos
			self.speed[:] = [0,0]
			return True
		return False

	def does_collide(self, other, deinterlace_vector = None):
		""" Return whether there is collision with other, if so and interlace_vector is given, fill it with how to move self to deinterlace """
		delta_pos = self.pos - other.pos
		sum_r = other.r + self.r
		cur_dist = np.linalg.norm(delta_pos)
		is_collision = cur_dist < sum_r
		if is_collision and deinterlace_vector is not None:
			if cur_dist == 0:
				deinterlace_vector[:] = [sum_r, 0]
			else:
				deinterlace_vector[:] = delta_pos * (sum_r - cur_dist) / cur_dist
		return is_collision

	@abstractmethod
	def get_object_type(self):
		pass

	def get_json_state(self, full):
		json_state = {
			'id': self.id,
			'pos': _numpy_rounded(self.pos),
			'speed': _numpy_rounded(self.speed),
		}
		if full:
			json_state['object'] = self.get_object_type()
		return json_state


class Ball(GameObject):
	def __init__(self, id):
		GameObject.__init__(self, id, 0.9)

	def get_object_type(self):
		return "ball"


class Box(GameObject):
	def __init__(self, id):
		GameObject.__init__(self, id, 1)

	def get_object_type(self):
		return "box"


class SuperBox(GameObject):
	def __init__(self, id):
		GameObject.__init__(self, id, 1.5)

	def get_object_type(self):
		return "superbox"


class Player(GameObject):
	def __init__(self, name, id):
		GameObject.__init__(self, id, 1.5)
		self.name = name
		self.has_ball = False
		self.score = 0
		self.last_time_stunned = 0.
		self.speed_cmd = np.zeros(2)

	def move(self, speed, factor):
		self.speed_cmd = np.array(speed) * factor

	def step(self, dt, cur_time):
		# can we apply speed?
		old_speed = self.speed
		if not self.is_stunned(cur_time):
			self.speed = self.speed_cmd
		# do the step
		need_update = super(Player, self).step(dt, cur_time)
		# should we send update?
		return need_update or not np.array_equal(old_speed, self.speed)

	def get_object_type(self):
		return "player"

	def is_stunned(self, cur_time):
		return cur_time - self.last_time_stunned < STUNNED_DURATION

	def get_json_state(self, full):
		json_state = super(Player, self).get_json_state(full)
		if full:
			json_state['name'] = self.name
		json_state['has_ball'] = self.has_ball
		json_state['score'] = self.score
		return json_state