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
		self.id = id
		self.r = r
		self.pos = np.zeros(2)
		self.speed = np.zeros(2)
		super().__init__()
	
	def move(self, speed, factor):
		self.speed = np.array(speed) * factor
	
	def step(self, dt):
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
		GameObject.__init__(self, id, 1)
	
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
		GameObject.__init__(self, id, 2)
		self.name = name
		self.hits = 0
		self.last_fire_time = time.time()
	
	def get_object_type(self):
		return "player"
	
	def get_json_state(self, full):
		json_state = super(Player, self).get_json_state(full)
		if full:
			json_state['name'] = self.name
		json_state['hits'] = self.hits
		return json_state
